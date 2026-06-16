import { getPool, isDbConfigured } from '@/lib/db';
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
import { isPostgrestMissingTableError } from '@/lib/crmSchemaError';
import type {
  EmailSendJob,
  EmailTemplateType,
  SendJobSelectionMode,
  SendJobStatus,
} from '@/lib/emailMarketing/types';

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

function requireDb() {
  if (!isDbConfigured()) throw new EmailMarketingNotConfiguredError();
  return getPool();
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
  const { rows } = await requireDb().query<DbJob>(
    `SELECT * FROM em_send_jobs WHERE status = ANY($1) ORDER BY created_at ASC LIMIT 1`,
    [ACTIVE_STATUSES]
  );
  return rows.length ? mapJob(rows[0]) : null;
}

export async function getSendJob(id: string): Promise<EmailSendJob | null> {
  const { rows } = await requireDb().query<DbJob>(
    'SELECT * FROM em_send_jobs WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows.length ? mapJob(rows[0]) : null;
}

async function resolveRecipientIds(selection: {
  selectionMode: SendJobSelectionMode;
  recipientIds?: string[];
}): Promise<string[]> {
  if (selection.selectionMode === 'all_not_sent') {
    return listRecipientIdsByStatus('not_sent');
  }
  return [...new Set((selection.recipientIds ?? []).filter(Boolean))];
}

export async function createSendJob(params: {
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  selectionMode: SendJobSelectionMode;
  recipientIds?: string[];
}): Promise<EmailSendJob> {
  const active = await getActiveSendJob();
  if (active) throw new Error('A send job is already in progress. Wait for it to finish or cancel it.');

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

  const { rows } = await requireDb().query<DbJob>(
    `INSERT INTO em_send_jobs
       (campaign_id, status, template_type, auto_follow_up, selection_mode,
        recipient_ids, total_count, processed_index, sent_count, failed_count)
     VALUES ($1,'queued',$2,$3,$4,$5,$6,0,0,0)
     RETURNING *`,
    [
      campaignId,
      params.templateType,
      params.autoFollowUp,
      params.selectionMode,
      JSON.stringify(recipientIds),
      recipientIds.length,
    ]
  );
  return mapJob(rows[0]);
}

export async function cancelSendJob(id: string): Promise<EmailSendJob | null> {
  const job = await getSendJob(id);
  if (!job || !ACTIVE_STATUSES.includes(job.status)) return job;

  const { rows } = await requireDb().query<DbJob>(
    `UPDATE em_send_jobs
        SET status = 'cancelled', completed_at = $1, last_error = 'Cancelled by admin'
      WHERE id = $2
      RETURNING *`,
    [new Date().toISOString(), id]
  );
  return rows.length ? mapJob(rows[0]) : null;
}

export type ProcessSendJobResult = {
  ran: boolean;
  job: EmailSendJob | null;
  batchSent: number;
  batchFailed: number;
};

export async function processSendJobBatch(): Promise<ProcessSendJobResult> {
  const pool = requireDb();
  const batchSize = getBatchSize();

  let jobRow: DbJob | undefined;
  try {
    const { rows } = await pool.query<DbJob>(
      `SELECT * FROM em_send_jobs WHERE status = ANY($1) ORDER BY created_at ASC LIMIT 1`,
      [ACTIVE_STATUSES]
    );
    jobRow = rows[0];
  } catch (e) {
    throwIfDb(e);
  }

  if (!jobRow) return { ran: false, job: null, batchSent: 0, batchFailed: 0 };

  const job = mapJob(jobRow);
  const ids: string[] = Array.isArray(jobRow.recipient_ids) ? jobRow.recipient_ids : [];

  if (job.processedIndex >= ids.length) {
    await finalizeJob(job.id, job.campaignId, job.sentCount, job.failedCount);
    const done = await getSendJob(job.id);
    return { ran: true, job: done, batchSent: 0, batchFailed: 0 };
  }

  if (job.status === 'queued') {
    await pool.query(
      `UPDATE em_send_jobs SET status = 'running', started_at = $1 WHERE id = $2`,
      [new Date().toISOString(), job.id]
    );
  }

  const slice = ids.slice(job.processedIndex, job.processedIndex + batchSize);
  const template = await getTemplate(job.templateType);
  if (!template) {
    await pool.query(
      `UPDATE em_send_jobs SET status = 'failed', last_error = 'Template not found', completed_at = $1 WHERE id = $2`,
      [new Date().toISOString(), job.id]
    );
    return { ran: true, job: await getSendJob(job.id), batchSent: 0, batchFailed: 0 };
  }

  const campaignId = job.campaignId;
  if (!campaignId) {
    await pool.query(
      `UPDATE em_send_jobs SET status = 'failed', last_error = 'Missing campaign id', completed_at = $1 WHERE id = $2`,
      [new Date().toISOString(), job.id]
    );
    return { ran: true, job: await getSendJob(job.id), batchSent: 0, batchFailed: 0 };
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

  await pool.query(
    `UPDATE em_send_jobs
        SET processed_index = $1, sent_count = $2, failed_count = $3,
            last_error = $4, status = $5, completed_at = $6
      WHERE id = $7`,
    [
      newProcessed,
      newSent,
      newFailed,
      errSample,
      isDone ? 'completed' : 'running',
      isDone ? new Date().toISOString() : null,
      job.id,
    ]
  );

  if (isDone) {
    await finalizeJob(job.id, campaignId, newSent, newFailed);
  } else {
    await pool.query(
      'UPDATE em_campaigns SET sent_count = $1, failed_count = $2 WHERE id = $3',
      [newSent, newFailed, campaignId]
    );
  }

  return {
    ran: true,
    job: await getSendJob(job.id),
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
  void jobId;
  if (!campaignId) return;
  await getPool().query(
    'UPDATE em_campaigns SET sent_count = $1, failed_count = $2 WHERE id = $3',
    [sent, failed, campaignId]
  );
}
