import { getPool, isDbConfigured } from '@/lib/db';
import {
  decryptField,
  decryptJson,
  emailLookupHash,
  encryptField,
  encryptJson,
} from '@/lib/gdprFieldCrypto';
import { emptyDraft, normalizeDraft, type ProposalDraft } from '@/lib/proposalSchema';
import { isPostgrestMissingTableError, throwIfDbError } from '@/lib/crmSchemaError';
import type { SupportLeadSource } from '@/lib/supportLeads';

export type FollowUpStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export type ConversationSnapshot = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; ts: string }>;
  draft: ProposalDraft;
};

export type CrmLeadRow = {
  id: string;
  conversationId: string;
  timestamp: string;
  source: SupportLeadSource;
  fullName: string;
  email: string;
  company: string;
  phone: string;
  followUpStatus: FollowUpStatus;
  followUpNotes: string;
  followUpNextAt: string | null;
  followUpUpdatedAt: string | null;
};

export type AdminConversationSummary = {
  conversationId: string;
  leadId: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  company: string | null;
  source: SupportLeadSource | null;
  messageCount: number;
  followUpStatus: FollowUpStatus;
  followUpNextAt: string | null;
  updatedAt: string;
  createdAt: string;
};

export type AdminConversationDetail = AdminConversationSummary & {
  followUpNotes: string;
  followUpUpdatedAt: string | null;
  messages: ConversationSnapshot['messages'];
  draft: ProposalDraft;
  proposalVersions: AdminProposalQueueRow[];
};

export type ProposalFinalizeLogEntry = {
  versionId: string;
  conversationId: string;
  visitorEmail: string;
  visitorName: string;
  pdfStatus: 'ready' | 'failed' | 'queued';
  pdfError?: string;
  finalizedAt: string;
  visitorNotifiedPdfIssue?: boolean;
  pdfEmailedByAdminAt?: string;
};

export type AdminProposalQueueRow = ProposalFinalizeLogEntry & {
  pdfFilePresent: boolean;
};

type DbLead = {
  id: string;
  conversation_id: string;
  source: string;
  email_lookup_hash: string;
  full_name_enc: string;
  email_enc: string;
  company_enc: string;
  phone_enc: string;
  follow_up_status: FollowUpStatus;
  follow_up_notes_enc: string;
  follow_up_next_at: string | null;
  follow_up_updated_at: string | null;
  created_at: string;
};

type DbConversation = {
  id: string;
  snapshot_enc: string;
  message_count: number;
  created_at: string;
  updated_at: string;
};

type DbProposalVersion = {
  id: string;
  conversation_id: string;
  lead_id: string | null;
  visitor_email_lookup_hash: string;
  visitor_name_enc: string;
  visitor_email_enc: string;
  draft_snapshot_enc: string;
  estimate_enc: string;
  markdown_enc: string;
  pdf_status: 'queued' | 'ready' | 'failed';
  pdf_error_enc: string;
  pdf_storage_path: string | null;
  pdf_bytes: Buffer | null;
  finalized_at: string;
  expires_at: string;
  visitor_notified_pdf_issue: boolean;
  pdf_emailed_by_admin_at: string | null;
  created_at: string;
};

export class CrmNotConfiguredError extends Error {
  constructor() {
    super('CRM requires DATABASE_URL and DATA_ENCRYPTION_KEY env vars.');
    this.name = 'CrmNotConfiguredError';
  }
}

function requireCrm(): void {
  if (!isDbConfigured()) throw new CrmNotConfiguredError();
  if (!process.env.DATA_ENCRYPTION_KEY?.trim()) {
    throw new Error('DATA_ENCRYPTION_KEY is required for GDPR field encryption');
  }
}

function db() {
  requireCrm();
  return getPool();
}

function decryptLeadRow(row: DbLead): CrmLeadRow {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    timestamp: row.created_at,
    source: row.source as SupportLeadSource,
    fullName: decryptField(row.full_name_enc),
    email: decryptField(row.email_enc),
    company: decryptField(row.company_enc),
    phone: decryptField(row.phone_enc),
    followUpStatus: row.follow_up_status,
    followUpNotes: decryptField(row.follow_up_notes_enc),
    followUpNextAt: row.follow_up_next_at,
    followUpUpdatedAt: row.follow_up_updated_at,
  };
}

function snapshotFromDb(row: DbConversation): ConversationSnapshot {
  const snap = decryptJson<ConversationSnapshot>(row.snapshot_enc);
  return {
    ...snap,
    id: row.id,
    draft: normalizeDraft(snap.draft ?? emptyDraft),
  };
}

export async function loadConversationSnapshot(conversationId: string): Promise<ConversationSnapshot | null> {
  try {
    const { rows } = await db().query<DbConversation>(
      'SELECT * FROM crm_conversations WHERE id = $1 LIMIT 1',
      [conversationId]
    );
    if (!rows.length) return null;
    return snapshotFromDb(rows[0]);
  } catch (e) {
    throwIfDbError(e);
    return null;
  }
}

export async function saveConversationSnapshot(snapshot: ConversationSnapshot): Promise<void> {
  const enc = encryptJson(snapshot);
  try {
    await db().query(
      `INSERT INTO crm_conversations (id, snapshot_enc, message_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE
         SET snapshot_enc = EXCLUDED.snapshot_enc,
             message_count = EXCLUDED.message_count,
             updated_at = EXCLUDED.updated_at`,
      [snapshot.id, enc, snapshot.messages.length, snapshot.createdAt, snapshot.updatedAt]
    );
  } catch (e) {
    throwIfDbError(e);
  }
}

export async function upsertLeadForConversation(input: {
  conversationId: string;
  source: SupportLeadSource;
  fullName: string;
  email: string;
  company: string;
  phone: string;
}): Promise<CrmLeadRow> {
  const now = new Date().toISOString();
  const convoId = input.conversationId;

  const existing = await loadConversationSnapshot(convoId);
  if (!existing) {
    await saveConversationSnapshot({
      id: convoId,
      createdAt: now,
      updatedAt: now,
      messages: [],
      draft: emptyDraft,
    });
  }

  const pool = db();
  const { rows: existingLeads } = await pool.query<{ id: string }>(
    'SELECT id FROM crm_leads WHERE conversation_id = $1 LIMIT 1',
    [convoId]
  );

  const leadPayload = {
    conversation_id: convoId,
    source: input.source,
    email_lookup_hash: emailLookupHash(input.email),
    full_name_enc: encryptField(input.fullName),
    email_enc: encryptField(input.email),
    company_enc: encryptField(input.company),
    phone_enc: encryptField(input.phone || ''),
  };

  if (existingLeads.length) {
    const { rows } = await pool.query<DbLead>(
      `UPDATE crm_leads
          SET source = $1, email_lookup_hash = $2, full_name_enc = $3,
              email_enc = $4, company_enc = $5, phone_enc = $6
        WHERE id = $7
        RETURNING *`,
      [
        leadPayload.source,
        leadPayload.email_lookup_hash,
        leadPayload.full_name_enc,
        leadPayload.email_enc,
        leadPayload.company_enc,
        leadPayload.phone_enc,
        existingLeads[0].id,
      ]
    );
    return decryptLeadRow(rows[0]);
  }

  const { rows } = await pool.query<DbLead>(
    `INSERT INTO crm_leads
       (conversation_id, source, email_lookup_hash, full_name_enc, email_enc, company_enc, phone_enc)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      leadPayload.conversation_id,
      leadPayload.source,
      leadPayload.email_lookup_hash,
      leadPayload.full_name_enc,
      leadPayload.email_enc,
      leadPayload.company_enc,
      leadPayload.phone_enc,
    ]
  );
  return decryptLeadRow(rows[0]);
}

export async function listLeadsForAdmin(): Promise<CrmLeadRow[]> {
  const { rows } = await db().query<DbLead>(
    'SELECT * FROM crm_leads ORDER BY created_at DESC'
  );
  return rows.map(decryptLeadRow);
}

export async function deleteLeadById(leadId: string): Promise<boolean> {
  const { rowCount } = await db().query(
    'DELETE FROM crm_leads WHERE id = $1',
    [leadId]
  );
  return Boolean(rowCount);
}

export async function listConversationSummariesForAdmin(): Promise<AdminConversationSummary[]> {
  const pool = db();
  const { rows: convos } = await pool.query<DbConversation>(
    'SELECT * FROM crm_conversations ORDER BY updated_at DESC'
  );
  const { rows: leads } = await pool.query<DbLead>('SELECT * FROM crm_leads');

  const leadByConvo = new Map<string, DbLead>();
  for (const l of leads) leadByConvo.set(l.conversation_id, l);

  return convos.map((c) => {
    const lead = leadByConvo.get(c.id);
    return {
      conversationId: c.id,
      leadId: lead?.id ?? null,
      visitorName: lead ? decryptField(lead.full_name_enc) : null,
      visitorEmail: lead ? decryptField(lead.email_enc) : null,
      company: lead ? decryptField(lead.company_enc) : null,
      source: lead ? (lead.source as SupportLeadSource) : null,
      messageCount: c.message_count,
      followUpStatus: lead?.follow_up_status ?? 'new',
      followUpNextAt: lead?.follow_up_next_at ?? null,
      updatedAt: c.updated_at,
      createdAt: c.created_at,
    };
  });
}

export async function getConversationDetailForAdmin(
  conversationId: string
): Promise<AdminConversationDetail | null> {
  const pool = db();
  const { rows: convos } = await pool.query<DbConversation>(
    'SELECT * FROM crm_conversations WHERE id = $1 LIMIT 1',
    [conversationId]
  );
  if (!convos.length) return null;
  const convo = convos[0];

  const { rows: leads } = await pool.query<DbLead>(
    'SELECT * FROM crm_leads WHERE conversation_id = $1 LIMIT 1',
    [conversationId]
  );
  const lead = leads[0] ?? null;

  const { rows: versions } = await pool.query<DbProposalVersion>(
    'SELECT * FROM crm_proposal_versions WHERE conversation_id = $1 ORDER BY finalized_at DESC',
    [conversationId]
  );

  const snap = snapshotFromDb(convo);
  const proposalVersions = await Promise.all(versions.map(versionToAdminRow));

  return {
    conversationId,
    leadId: lead?.id ?? null,
    visitorName: lead ? decryptField(lead.full_name_enc) : null,
    visitorEmail: lead ? decryptField(lead.email_enc) : null,
    company: lead ? decryptField(lead.company_enc) : null,
    source: lead ? (lead.source as SupportLeadSource) : null,
    messageCount: convo.message_count,
    followUpStatus: lead?.follow_up_status ?? 'new',
    followUpNextAt: lead?.follow_up_next_at ?? null,
    followUpUpdatedAt: lead?.follow_up_updated_at ?? null,
    updatedAt: convo.updated_at,
    createdAt: convo.created_at,
    followUpNotes: lead ? decryptField(lead.follow_up_notes_enc) : '',
    messages: snap.messages,
    draft: snap.draft,
    proposalVersions,
  };
}

export async function updateConversationFollowUp(
  conversationId: string,
  patch: {
    followUpStatus?: FollowUpStatus;
    followUpNotes?: string;
    followUpNextAt?: string | null;
  }
): Promise<boolean> {
  const pool = db();
  const { rows } = await pool.query<{ id: string }>(
    'SELECT id FROM crm_leads WHERE conversation_id = $1 LIMIT 1',
    [conversationId]
  );
  if (!rows.length) return false;

  const sets: string[] = ['follow_up_updated_at = $1'];
  const values: unknown[] = [new Date().toISOString()];

  if (patch.followUpStatus !== undefined) {
    sets.push(`follow_up_status = $${values.length + 1}`);
    values.push(patch.followUpStatus);
  }
  if (patch.followUpNotes !== undefined) {
    sets.push(`follow_up_notes_enc = $${values.length + 1}`);
    values.push(encryptField(patch.followUpNotes));
  }
  if (patch.followUpNextAt !== undefined) {
    sets.push(`follow_up_next_at = $${values.length + 1}`);
    values.push(patch.followUpNextAt);
  }

  values.push(rows[0].id);
  await pool.query(
    `UPDATE crm_leads SET ${sets.join(', ')} WHERE id = $${values.length}`,
    values
  );
  return true;
}

export async function createProposalVersion(input: {
  versionId: string;
  conversationId: string;
  visitorEmail: string;
  visitorName: string;
  draftSnapshot: ProposalDraft;
  estimate: unknown;
  markdown: string;
  expiresAt: string;
  leadId?: string | null;
}): Promise<void> {
  await db().query(
    `INSERT INTO crm_proposal_versions
       (id, conversation_id, lead_id, visitor_email_lookup_hash, visitor_name_enc,
        visitor_email_enc, draft_snapshot_enc, estimate_enc, markdown_enc,
        pdf_status, pdf_error_enc, pdf_storage_path, finalized_at, expires_at,
        visitor_notified_pdf_issue)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'queued','',$10,$11,$12,false)`,
    [
      input.versionId,
      input.conversationId,
      input.leadId ?? null,
      input.visitorEmail ? emailLookupHash(input.visitorEmail) : '',
      encryptField(input.visitorName),
      encryptField(input.visitorEmail),
      encryptJson(input.draftSnapshot),
      encryptJson(input.estimate),
      encryptField(input.markdown),
      null,
      new Date().toISOString(),
      input.expiresAt,
    ]
  );
}

export async function updateProposalVersionPdf(
  versionId: string,
  patch: {
    pdfStatus?: 'ready' | 'failed' | 'queued';
    pdfError?: string;
    pdfStoragePath?: string | null;
    visitorNotifiedPdfIssue?: boolean;
  }
): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.pdfStatus !== undefined) {
    sets.push(`pdf_status = $${values.length + 1}`);
    values.push(patch.pdfStatus);
  }
  if (patch.pdfError !== undefined) {
    sets.push(`pdf_error_enc = $${values.length + 1}`);
    values.push(encryptField(patch.pdfError));
  }
  if (patch.pdfStoragePath !== undefined) {
    sets.push(`pdf_storage_path = $${values.length + 1}`);
    values.push(patch.pdfStoragePath);
  }
  if (patch.visitorNotifiedPdfIssue !== undefined) {
    sets.push(`visitor_notified_pdf_issue = $${values.length + 1}`);
    values.push(patch.visitorNotifiedPdfIssue);
  }
  if (!sets.length) return;

  values.push(versionId);
  await db().query(
    `UPDATE crm_proposal_versions SET ${sets.join(', ')} WHERE id = $${values.length}`,
    values
  );
}

export async function uploadProposalPdf(versionId: string, pdfBytes: Buffer): Promise<string> {
  const path = `${versionId}.pdf`;
  await db().query(
    'UPDATE crm_proposal_versions SET pdf_bytes = $1, pdf_status = $2, pdf_storage_path = $3 WHERE id = $4',
    [pdfBytes, 'ready', path, versionId]
  );
  return path;
}

export async function readProposalPdfBytes(versionId: string): Promise<Buffer | null> {
  const { rows } = await db().query<{ pdf_bytes: Buffer | null }>(
    'SELECT pdf_bytes FROM crm_proposal_versions WHERE id = $1 LIMIT 1',
    [versionId]
  );
  return rows[0]?.pdf_bytes ?? null;
}

async function versionToAdminRow(v: DbProposalVersion): Promise<AdminProposalQueueRow> {
  const pdfFilePresent = v.pdf_status === 'ready' && Boolean(v.pdf_storage_path ?? v.pdf_bytes);
  return {
    versionId: v.id,
    conversationId: v.conversation_id,
    visitorEmail: decryptField(v.visitor_email_enc),
    visitorName: decryptField(v.visitor_name_enc),
    pdfStatus: v.pdf_status,
    pdfError: v.pdf_error_enc ? decryptField(v.pdf_error_enc) : undefined,
    finalizedAt: v.finalized_at,
    visitorNotifiedPdfIssue: v.visitor_notified_pdf_issue || undefined,
    pdfEmailedByAdminAt: v.pdf_emailed_by_admin_at ?? undefined,
    pdfFilePresent,
  };
}

export async function readProposalFinalizeLogForAdmin(): Promise<AdminProposalQueueRow[]> {
  const { rows } = await db().query<DbProposalVersion>(
    'SELECT * FROM crm_proposal_versions ORDER BY finalized_at DESC LIMIT 250'
  );
  return Promise.all(rows.map(versionToAdminRow));
}

export async function getProposalVersionById(versionId: string): Promise<DbProposalVersion | null> {
  const { rows } = await db().query<DbProposalVersion>(
    'SELECT * FROM crm_proposal_versions WHERE id = $1 LIMIT 1',
    [versionId]
  );
  return rows[0] ?? null;
}

export async function getProposalVersionMarkdown(versionId: string): Promise<string | null> {
  const v = await getProposalVersionById(versionId);
  if (!v?.markdown_enc) return null;
  return decryptField(v.markdown_enc);
}

export async function getLogEntryByVersionId(versionId: string): Promise<ProposalFinalizeLogEntry | null> {
  const v = await getProposalVersionById(versionId);
  if (!v) return null;
  const row = await versionToAdminRow(v);
  return {
    versionId: row.versionId,
    conversationId: row.conversationId,
    visitorEmail: row.visitorEmail,
    visitorName: row.visitorName,
    pdfStatus: row.pdfStatus,
    pdfError: row.pdfError,
    finalizedAt: row.finalizedAt,
    visitorNotifiedPdfIssue: row.visitorNotifiedPdfIssue,
    pdfEmailedByAdminAt: row.pdfEmailedByAdminAt,
  };
}

export async function updateProposalFinalizeLogEntry(
  versionId: string,
  patch: Partial<Pick<ProposalFinalizeLogEntry, 'pdfEmailedByAdminAt' | 'visitorNotifiedPdfIssue'>>
): Promise<boolean> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.pdfEmailedByAdminAt !== undefined) {
    sets.push(`pdf_emailed_by_admin_at = $${values.length + 1}`);
    values.push(patch.pdfEmailedByAdminAt);
  }
  if (patch.visitorNotifiedPdfIssue !== undefined) {
    sets.push(`visitor_notified_pdf_issue = $${values.length + 1}`);
    values.push(patch.visitorNotifiedPdfIssue);
  }
  if (!sets.length) return false;

  values.push(versionId);
  const { rowCount } = await db().query(
    `UPDATE crm_proposal_versions SET ${sets.join(', ')} WHERE id = $${values.length}`,
    values
  );
  return Boolean(rowCount);
}

export async function getLeadIdByConversation(conversationId: string): Promise<string | null> {
  const { rows } = await db().query<{ id: string }>(
    'SELECT id FROM crm_leads WHERE conversation_id = $1 LIMIT 1',
    [conversationId]
  );
  return rows[0]?.id ?? null;
}

export function isCrmReady(): boolean {
  return isDbConfigured() && Boolean(process.env.DATA_ENCRYPTION_KEY?.trim());
}

export async function isCrmSchemaApplied(): Promise<boolean> {
  if (!isCrmReady()) return false;
  try {
    await getPool().query('SELECT id FROM crm_conversations LIMIT 1');
    return true;
  } catch (e) {
    if (isPostgrestMissingTableError(e)) return false;
    return false;
  }
}
