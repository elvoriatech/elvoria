import { formatMailSendError, getCampaignSentCopyBcc, sendSiteHtmlEmail } from '@/lib/siteMailer';
import { SEND_CHUNK_DELAY_MS, SEND_RECIPIENTS_CHUNK } from '@/lib/emailMarketing/constants';
import { buildFullMarketingEmailHtml } from '@/lib/emailMarketing/emailLayout';
import {
  getMarketingEmailLogoAttachment,
  marketingLogoCidSrc,
} from '@/lib/emailMarketing/emailLogoAttachment';
import { applyTemplateVars, recipientToVars } from '@/lib/emailMarketing/templateVars';
import {
  appendSendLog,
  createCampaign,
  getRecipientsByIds,
  getTemplate,
  updateRecipientAfterSend,
} from '@/lib/emailMarketing/store';
import type { EmailTemplateType } from '@/lib/emailMarketing/types';

export type SendCampaignResult = {
  campaignId: string;
  sent: number;
  failed: number;
  errors: string[];
  /** Recipient IDs that were emailed successfully (status → sent in DB). */
  sentRecipientIds: string[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendBatchToRecipients(params: {
  recipients: Awaited<ReturnType<typeof getRecipientsByIds>>;
  template: NonNullable<Awaited<ReturnType<typeof getTemplate>>>;
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  campaignId: string;
}): Promise<{ sent: number; failed: number; errors: string[]; sentRecipientIds: string[] }> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const sentRecipientIds: string[] = [];
  const sentCopyBcc = getCampaignSentCopyBcc();

  for (const r of params.recipients) {
    const vars = recipientToVars(r);
    const subject = applyTemplateVars(params.template.subject, vars);
    const bodyHtml = applyTemplateVars(params.template.bodyHtml, vars);
    const html = buildFullMarketingEmailHtml(bodyHtml, {
      logoSrc: marketingLogoCidSrc(),
      preheader: subject,
    });
    const attachments = getMarketingEmailLogoAttachment();

    const result = await sendSiteHtmlEmail({
      to: r.email,
      subject,
      html,
      bcc: sentCopyBcc,
      attachments: attachments.length ? attachments : undefined,
    });

    if (result.sent) {
      sent++;
      sentRecipientIds.push(r.id);
      await updateRecipientAfterSend(r.id, params.templateType, {
        autoFollowUp: params.autoFollowUp && params.templateType === 'initial',
        success: true,
      });
      await appendSendLog({
        campaignId: params.campaignId,
        recipientId: r.id,
        templateType: params.templateType,
        email: r.email,
        status: 'sent',
      });
    } else {
      failed++;
      const detail =
        result.reason === 'not_configured'
          ? 'Email not configured on server'
          : formatMailSendError(result.detail || 'Send failed');
      errors.push(`${r.email}: ${detail}`);
      await appendSendLog({
        campaignId: params.campaignId,
        recipientId: r.id,
        templateType: params.templateType,
        email: r.email,
        status: 'failed',
        errorMessage: detail,
      });
    }
  }

  return { sent, failed, errors, sentRecipientIds };
}

export async function sendCampaignEmails(params: {
  templateType: EmailTemplateType;
  recipientIds: string[];
  autoFollowUp: boolean;
}): Promise<SendCampaignResult> {
  const template = await getTemplate(params.templateType);
  if (!template) throw new Error('Template not found');

  const uniqueIds = [...new Set(params.recipientIds)];
  if (!uniqueIds.length) throw new Error('No valid recipients selected');

  const campaignId = await createCampaign({
    templateType: params.templateType,
    autoFollowUp: params.autoFollowUp,
    recipientCount: uniqueIds.length,
    sentCount: 0,
    failedCount: 0,
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const sentRecipientIds: string[] = [];

  for (let i = 0; i < uniqueIds.length; i += SEND_RECIPIENTS_CHUNK) {
    if (i > 0) await sleep(SEND_CHUNK_DELAY_MS);
    const chunkIds = uniqueIds.slice(i, i + SEND_RECIPIENTS_CHUNK);
    const recipients = await getRecipientsByIds(chunkIds);
    if (!recipients.length) continue;

    const chunkResult = await sendBatchToRecipients({
      recipients,
      template,
      templateType: params.templateType,
      autoFollowUp: params.autoFollowUp,
      campaignId,
    });
    sent += chunkResult.sent;
    failed += chunkResult.failed;
    errors.push(...chunkResult.errors);
    sentRecipientIds.push(...chunkResult.sentRecipientIds);
  }

  if (!sent && !failed) throw new Error('No valid recipients selected');

  const { getPool } = await import('@/lib/db');
  await getPool().query(
    'UPDATE em_campaigns SET sent_count = $1, failed_count = $2 WHERE id = $3',
    [sent, failed, campaignId]
  );

  return { campaignId, sent, failed, errors, sentRecipientIds };
}

export async function processAutoFollowUps(): Promise<{
  followUp1: SendCampaignResult | null;
  followUp2: SendCampaignResult | null;
}> {
  const { listRecipientsForAutoFollowUp } = await import('@/lib/emailMarketing/store');
  const { followUp1, followUp2 } = await listRecipientsForAutoFollowUp();

  let r1: SendCampaignResult | null = null;
  let r2: SendCampaignResult | null = null;

  if (followUp1.length) {
    r1 = await sendCampaignEmails({
      templateType: 'follow_up_1',
      recipientIds: followUp1.map((r) => r.id),
      autoFollowUp: true,
    });
  }
  if (followUp2.length) {
    r2 = await sendCampaignEmails({
      templateType: 'follow_up_2',
      recipientIds: followUp2.map((r) => r.id),
      autoFollowUp: true,
    });
  }

  return { followUp1: r1, followUp2: r2 };
}
