import { SEND_JOB_BATCH_SIZE } from '@/lib/emailMarketing/constants';
import { sendBatchToRecipients } from '@/lib/emailMarketing/send';
import {
  createCampaign,
  EmailMarketingNotConfiguredError,
  EmailMarketingSchemaNotAppliedError,
  getRecipientsByIds,
  getTemplate,
  listRecipientIdsByStatus,
} from '@/lib/emailMarketing/store';
import type {
  EmailSendJob,
  EmailTemplateType,
  SendJobSelectionMode,
  SendJobStatus,
} from '@/lib/emailMarketing/types';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { isPostgrestMissingTableError } from '@/lib/crmSchemaError';

type DbJob = {
  id: string;
  campaign_id: string | null;
  status: SendJobStatus;
  template_type: EmailTemplateType;
  auto_follow_up: boolean;
  selection_mode: SendJobSelectionMode;
  recipient_ids: string[];
  processed_index: number;
  total_count: number;
  sent_count: number;
  failed_count: number;
  last_error: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

function requireSb() {
  if (!isSupabaseConfigured()) throw new EmailMarketingNotConfiguredError();
  return createAdminClient();
}

function throwIfDb(error: unknown): void {
  if (!error) return;
  if (isPostgrestMissingTableError(error)) throw new EmailMarketingSchemaNotAppliedError();
  throw error;
}

function mapJob(row: DbJob): EmailSendJob {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    status: row.status,
    templateType: row.template_type,
    autoFollowUp: row.auto_follow_up,
    selectionMode: row.selection_mode,
    totalCount: row.total_count,
    processedIndex: row.processed_index,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
    lastError: row.last_error,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function getBatchSize(): number {
  const raw = Number(process.env.EMAIL_JOB_BATCH_SIZE);
  if (Number.isFinite(raw) && raw > 0 && raw <= 100) return Math.floor(raw);
  return SEND_JOB_BATCH_SIZE;
}

const ACTIVE_STATUSES: SendJobStatus[] = ['queued', 'running'];

export async function getActiveSendJob(): Promise<EmailSendJob | null> {
  const { data, error } = await requireSb()
    .from('em_send_jobs')
    .select('*')
    .in('status', ACTIVE_STATUSES)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  throwIfDb(error);
  if (!data) return null;
  return mapJob(data as DbJob);
}

export async function getSendJob(id: string): Promise<EmailSendJob | null> {
  const { data, error } = await requireSb().from('em_send_jobs').select('*').eq('id', id).maybeSingle();
  throwIfDb(error);
  if (!data) return null;
  return mapJob(data as DbJob);
}

async function resolveRecipientIds(selection: {
  selectionMode: SendJobSelectionMode;
  recipientIds?: string[];
}): Promise<string[]> {
  if (selection.selectionMode === 'all_not_sent') {
    return listRecipientIdsByStatus('not_sent');
  }
  const ids = [...new Set((selection.recipientIds ?? []).filter(Boolean))];
  return ids;
}

export async function createSendJob(params: {
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  selectionMode: SendJobSelectionMode;
  recipientIds?: string[];
}): Promise<EmailSendJob> {
  const active = await getActiveSendJob();
  if (active) {
    throw new Error('A send job is already in progress. Wait for it to finish or cancel it.');
  }

  const recipientIds = await resolveRecipientIds({
    selectionMode: params.selectionMode,
    recipientIds: params.recipientIds,
  });
  if (!recipientIds.length) throw new Error('No recipients to send to');

  const campaignId = await createCampaign({
    templateType: params.templateType,
    autoFollowUp: params.autoFollowUp,
    recipientCount: recipientIds.length,
    sentCount: 0,
    failedCount: 0,
  });

  const { data, error } = await requireSb()
    .from('em_send_jobs')
    .insert({
      campaign_id: campaignId,
      status: 'queued',
      template_type: params.templateType,
      auto_follow_up: params.autoFollowUp,
      selection_mode: params.selectionMode,
      recipient_ids: recipientIds,
      total_count: recipientIds.length,
      processed_index: 0,
      sent_count: 0,
      failed_count: 0,
    })
    .select('*')
    .single();
  throwIfDb(error);
  return mapJob(data as DbJob);
}

export async function cancelSendJob(id: string): Promise<EmailSendJob | null> {
  const job = await getSendJob(id);
  if (!job || !ACTIVE_STATUSES.includes(job.status)) return job;

  const { data, error } = await requireSb()
    .from('em_send_jobs')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      last_error: 'Cancelled by admin',
    })
    .eq('id', id)
    .select('*')
    .single();
  throwIfDb(error);
  return mapJob(data as DbJob);
}

export type ProcessSendJobResult = {
  ran: boolean;
  job: EmailSendJob | null;
  batchSent: number;
  batchFailed: number;
};

/** Process one batch for the oldest active job. Safe to call from cron or UI poll. */
export async function processSendJobBatch(): Promise<ProcessSendJobResult> {
  const sb = requireSb();
  const batchSize = getBatchSize();

  const { data: jobRow, error: fetchErr } = await sb
    .from('em_send_jobs')
    .select('*')
    .in('status', ACTIVE_STATUSES)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  throwIfDb(fetchErr);

  if (!jobRow) return { ran: false, job: null, batchSent: 0, batchFailed: 0 };

  const job = mapJob(jobRow as DbJob);
  const ids = Array.isArray(jobRow.recipient_ids) ? (jobRow.recipient_ids as string[]) : [];

  if (job.processedIndex >= ids.length) {
    await finalizeJob(job.id, job.campaignId, job.sentCount, job.failedCount);
    const done = await getSendJob(job.id);
    return { ran: true, job: done, batchSent: 0, batchFailed: 0 };
  }

  if (job.status === 'queued') {
    await sb
      .from('em_send_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', job.id);
  }

  const slice = ids.slice(job.processedIndex, job.processedIndex + batchSize);
  const template = await getTemplate(job.templateType);
  if (!template) {
    await sb
      .from('em_send_jobs')
      .update({
        status: 'failed',
        last_error: 'Template not found',
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);
    const failed = await getSendJob(job.id);
    return { ran: true, job: failed, batchSent: 0, batchFailed: 0 };
  }

  const campaignId = job.campaignId;
  if (!campaignId) {
    await sb
      .from('em_send_jobs')
      .update({
        status: 'failed',
        last_error: 'Missing campaign id',
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);
    const failed = await getSendJob(job.id);
    return { ran: true, job: failed, batchSent: 0, batchFailed: 0 };
  }

  const recipients = await getRecipientsByIds(slice);
  const batchResult = await sendBatchToRecipients({
    recipients,
    template,
    templateType: job.templateType,
    autoFollowUp: job.autoFollowUp,
    campaignId,
  });

  const newProcessed = job.processedIndex + slice.length;
  const newSent = job.sentCount + batchResult.sent;
  const newFailed = job.failedCount + batchResult.failed;
  const errSample = batchResult.errors.slice(0, 2).join('; ');

  const isDone = newProcessed >= ids.length;

  const { error: updateErr } = await sb
    .from('em_send_jobs')
    .update({
      processed_index: newProcessed,
      sent_count: newSent,
      failed_count: newFailed,
      last_error: errSample,
      ...(isDone
        ? { status: 'completed' as const, completed_at: new Date().toISOString() }
        : { status: 'running' as const }),
    })
    .eq('id', job.id);
  throwIfDb(updateErr);

  if (isDone) {
    await finalizeJob(job.id, campaignId, newSent, newFailed);
  } else {
    await sb
      .from('em_campaigns')
      .update({ sent_count: newSent, failed_count: newFailed })
      .eq('id', campaignId);
  }

  const updated = await getSendJob(job.id);
  return {
    ran: true,
    job: updated,
    batchSent: batchResult.sent,
    batchFailed: batchResult.failed,
  };
}

async function finalizeJob(
  jobId: string,
  campaignId: string | null,
  sent: number,
  failed: number
): Promise<void> {
  const sb = requireSb();
  if (campaignId) {
    await sb.from('em_campaigns').update({ sent_count: sent, failed_count: failed }).eq('id', campaignId);
  }
}
