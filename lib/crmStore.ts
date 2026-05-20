import { createAdminClient, isSupabaseConfigured } from '@/lib/supabaseAdmin';
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

const PDF_BUCKET = 'proposal-pdfs';

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
  finalized_at: string;
  expires_at: string;
  visitor_notified_pdf_issue: boolean;
  pdf_emailed_by_admin_at: string | null;
  created_at: string;
};

export class CrmNotConfiguredError extends Error {
  constructor() {
    super(
      'CRM requires Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) and supabase/crm_schema.sql applied.'
    );
    this.name = 'CrmNotConfiguredError';
  }
}

function requireCrm(): void {
  if (!isSupabaseConfigured()) throw new CrmNotConfiguredError();
  if (!process.env.DATA_ENCRYPTION_KEY?.trim()) {
    throw new Error('DATA_ENCRYPTION_KEY is required for GDPR field encryption');
  }
}

function sb() {
  requireCrm();
  return createAdminClient();
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
  const { data, error } = await sb()
    .from('crm_conversations')
    .select('*')
    .eq('id', conversationId)
    .maybeSingle();
  throwIfDbError(error);
  if (!data) return null;
  return snapshotFromDb(data as DbConversation);
}

export async function saveConversationSnapshot(snapshot: ConversationSnapshot): Promise<void> {
  const client = sb();
  const enc = encryptJson(snapshot);
  const messageCount = snapshot.messages.length;
  const row = {
    id: snapshot.id,
    snapshot_enc: enc,
    message_count: messageCount,
    updated_at: snapshot.updatedAt,
  };
  const { error } = await client.from('crm_conversations').upsert(
    {
      ...row,
      created_at: snapshot.createdAt,
    },
    { onConflict: 'id' }
  );
  throwIfDbError(error);
}

export async function upsertLeadForConversation(input: {
  conversationId: string;
  source: SupportLeadSource;
  fullName: string;
  email: string;
  company: string;
  phone: string;
}): Promise<CrmLeadRow> {
  const client = sb();
  const now = new Date().toISOString();
  const convoId = input.conversationId;

  const existingConvo = await loadConversationSnapshot(convoId);
  if (!existingConvo) {
    const empty: ConversationSnapshot = {
      id: convoId,
      createdAt: now,
      updatedAt: now,
      messages: [],
      draft: emptyDraft,
    };
    await saveConversationSnapshot(empty);
  }

  const leadPayload = {
    conversation_id: convoId,
    source: input.source,
    email_lookup_hash: emailLookupHash(input.email),
    full_name_enc: encryptField(input.fullName),
    email_enc: encryptField(input.email),
    company_enc: encryptField(input.company),
    phone_enc: encryptField(input.phone || ''),
  };

  const { data: existingLead } = await client
    .from('crm_leads')
    .select('id')
    .eq('conversation_id', convoId)
    .maybeSingle();

  if (existingLead?.id) {
    const { data, error } = await client
      .from('crm_leads')
      .update(leadPayload)
      .eq('id', existingLead.id)
      .select('*')
      .single();
    throwIfDbError(error);
    return decryptLeadRow(data as DbLead);
  }

  const { data, error } = await client.from('crm_leads').insert(leadPayload).select('*').single();
  throwIfDbError(error);
  return decryptLeadRow(data as DbLead);
}

export async function listLeadsForAdmin(): Promise<CrmLeadRow[]> {
  const { data, error } = await sb()
    .from('crm_leads')
    .select('*')
    .order('created_at', { ascending: false });
  throwIfDbError(error);
  return ((data || []) as DbLead[]).map(decryptLeadRow);
}

export async function deleteLeadById(leadId: string): Promise<boolean> {
  const { data, error } = await sb().from('crm_leads').delete().eq('id', leadId).select('id');
  throwIfDbError(error);
  return Boolean(data?.length);
}

export async function listConversationSummariesForAdmin(): Promise<AdminConversationSummary[]> {
  const client = sb();
  const { data: convos, error: cErr } = await client
    .from('crm_conversations')
    .select('*')
    .order('updated_at', { ascending: false });
  if (cErr) throw cErr;

  const { data: leads, error: lErr } = await client.from('crm_leads').select('*');
  if (lErr) throw lErr;

  const leadByConvo = new Map<string, DbLead>();
  for (const l of (leads || []) as DbLead[]) {
    leadByConvo.set(l.conversation_id, l);
  }

  return ((convos || []) as DbConversation[]).map((c) => {
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
  const client = sb();
  const { data: convo, error: cErr } = await client
    .from('crm_conversations')
    .select('*')
    .eq('id', conversationId)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!convo) return null;

  const { data: lead } = await client.from('crm_leads').select('*').eq('conversation_id', conversationId).maybeSingle();

  const { data: versions, error: vErr } = await client
    .from('crm_proposal_versions')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('finalized_at', { ascending: false });
  if (vErr) throw vErr;

  const snap = snapshotFromDb(convo as DbConversation);
  const l = lead as DbLead | null;
  const proposalVersions = await Promise.all(
    ((versions || []) as DbProposalVersion[]).map((v) => versionToAdminRow(v))
  );

  return {
    conversationId,
    leadId: l?.id ?? null,
    visitorName: l ? decryptField(l.full_name_enc) : null,
    visitorEmail: l ? decryptField(l.email_enc) : null,
    company: l ? decryptField(l.company_enc) : null,
    source: l ? (l.source as SupportLeadSource) : null,
    messageCount: convo.message_count,
    followUpStatus: l?.follow_up_status ?? 'new',
    followUpNextAt: l?.follow_up_next_at ?? null,
    followUpUpdatedAt: l?.follow_up_updated_at ?? null,
    updatedAt: convo.updated_at,
    createdAt: convo.created_at,
    followUpNotes: l ? decryptField(l.follow_up_notes_enc) : '',
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
  const client = sb();
  const { data: lead } = await client.from('crm_leads').select('id').eq('conversation_id', conversationId).maybeSingle();
  if (!lead?.id) return false;

  const update: Record<string, unknown> = {
    follow_up_updated_at: new Date().toISOString(),
  };
  if (patch.followUpStatus !== undefined) update.follow_up_status = patch.followUpStatus;
  if (patch.followUpNotes !== undefined) update.follow_up_notes_enc = encryptField(patch.followUpNotes);
  if (patch.followUpNextAt !== undefined) update.follow_up_next_at = patch.followUpNextAt;

  const { error } = await client.from('crm_leads').update(update).eq('id', lead.id);
  throwIfDbError(error);
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
  const client = sb();
  const { error } = await client.from('crm_proposal_versions').insert({
    id: input.versionId,
    conversation_id: input.conversationId,
    lead_id: input.leadId ?? null,
    visitor_email_lookup_hash: input.visitorEmail ? emailLookupHash(input.visitorEmail) : '',
    visitor_name_enc: encryptField(input.visitorName),
    visitor_email_enc: encryptField(input.visitorEmail),
    draft_snapshot_enc: encryptJson(input.draftSnapshot),
    estimate_enc: encryptJson(input.estimate),
    markdown_enc: encryptField(input.markdown),
    pdf_status: 'queued',
    pdf_error_enc: '',
    pdf_storage_path: null,
    finalized_at: new Date().toISOString(),
    expires_at: input.expiresAt,
    visitor_notified_pdf_issue: false,
  });
  throwIfDbError(error);
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
  const update: Record<string, unknown> = {};
  if (patch.pdfStatus !== undefined) update.pdf_status = patch.pdfStatus;
  if (patch.pdfError !== undefined) update.pdf_error_enc = encryptField(patch.pdfError);
  if (patch.pdfStoragePath !== undefined) update.pdf_storage_path = patch.pdfStoragePath;
  if (patch.visitorNotifiedPdfIssue !== undefined) {
    update.visitor_notified_pdf_issue = patch.visitorNotifiedPdfIssue;
  }
  const { error } = await sb().from('crm_proposal_versions').update(update).eq('id', versionId);
  throwIfDbError(error);
}

export async function uploadProposalPdf(versionId: string, pdfBytes: Buffer): Promise<string> {
  const path = `${versionId}.pdf`;
  const { error } = await sb().storage.from(PDF_BUCKET).upload(path, pdfBytes, {
    contentType: 'application/pdf',
    upsert: true,
  });
  throwIfDbError(error);
  await updateProposalVersionPdf(versionId, { pdfStatus: 'ready', pdfStoragePath: path });
  return path;
}

export async function readProposalPdfBytes(versionId: string): Promise<Buffer | null> {
  const entry = await getProposalVersionById(versionId);
  if (!entry?.pdf_storage_path) return null;
  const { data, error } = await sb().storage.from(PDF_BUCKET).download(entry.pdf_storage_path);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

async function versionToAdminRow(v: DbProposalVersion): Promise<AdminProposalQueueRow> {
  const pdfFilePresent = v.pdf_status === 'ready' && Boolean(v.pdf_storage_path);
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
  const { data, error } = await sb()
    .from('crm_proposal_versions')
    .select('*')
    .order('finalized_at', { ascending: false })
    .limit(250);
  throwIfDbError(error);
  return Promise.all(((data || []) as DbProposalVersion[]).map(versionToAdminRow));
}

export async function getProposalVersionById(versionId: string): Promise<DbProposalVersion | null> {
  const { data, error } = await sb()
    .from('crm_proposal_versions')
    .select('*')
    .eq('id', versionId)
    .maybeSingle();
  throwIfDbError(error);
  return (data as DbProposalVersion | null) ?? null;
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
  const update: Record<string, unknown> = {};
  if (patch.pdfEmailedByAdminAt !== undefined) update.pdf_emailed_by_admin_at = patch.pdfEmailedByAdminAt;
  if (patch.visitorNotifiedPdfIssue !== undefined) {
    update.visitor_notified_pdf_issue = patch.visitorNotifiedPdfIssue;
  }
  if (!Object.keys(update).length) return false;
  const { data, error } = await sb()
    .from('crm_proposal_versions')
    .update(update)
    .eq('id', versionId)
    .select('id');
  throwIfDbError(error);
  return Boolean(data?.length);
}

export async function getLeadIdByConversation(conversationId: string): Promise<string | null> {
  const { data } = await sb().from('crm_leads').select('id').eq('conversation_id', conversationId).maybeSingle();
  return data?.id ?? null;
}

export function isCrmReady(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.DATA_ENCRYPTION_KEY?.trim());
}

/** True when env is set and `crm_conversations` exists (run supabase/crm_schema.sql). */
export async function isCrmSchemaApplied(): Promise<boolean> {
  if (!isCrmReady()) return false;
  const { error } = await createAdminClient().from('crm_conversations').select('id').limit(1);
  if (error && isPostgrestMissingTableError(error)) return false;
  return !error;
}
