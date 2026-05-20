import { formatMailSendError, sendSiteHtmlEmail } from '@/lib/siteMailer';
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
};

export async function sendCampaignEmails(params: {
  templateType: EmailTemplateType;
  recipientIds: string[];
  autoFollowUp: boolean;
}): Promise<SendCampaignResult> {
  const template = await getTemplate(params.templateType);
  if (!template) throw new Error('Template not found');

  const recipients = await getRecipientsByIds(params.recipientIds);
  if (!recipients.length) throw new Error('No valid recipients selected');

  const campaignId = await createCampaign({
    templateType: params.templateType,
    autoFollowUp: params.autoFollowUp,
    recipientCount: recipients.length,
    sentCount: 0,
    failedCount: 0,
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const r of recipients) {
    const vars = recipientToVars(r);
    const subject = applyTemplateVars(template.subject, vars);
    const bodyHtml = applyTemplateVars(template.bodyHtml, vars);
    const html = buildFullMarketingEmailHtml(bodyHtml, {
      logoSrc: marketingLogoCidSrc(),
      preheader: subject,
    });
    const attachments = getMarketingEmailLogoAttachment();

    const result = await sendSiteHtmlEmail({
      to: r.email,
      subject,
      html,
      attachments: attachments.length ? attachments : undefined,
    });

    if (result.sent) {
      sent++;
      await updateRecipientAfterSend(r.id, params.templateType, {
        autoFollowUp: params.autoFollowUp && params.templateType === 'initial',
        success: true,
      });
      await appendSendLog({
        campaignId,
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
        campaignId,
        recipientId: r.id,
        templateType: params.templateType,
        email: r.email,
        status: 'failed',
        errorMessage: detail,
      });
    }
  }

  const sb = await import('@/lib/supabaseAdmin').then((m) => m.createAdminClient());
  await sb
    .from('em_campaigns')
    .update({ sent_count: sent, failed_count: failed })
    .eq('id', campaignId);

  return { campaignId, sent, failed, errors };
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
