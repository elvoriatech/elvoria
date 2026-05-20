import { createAdminClient, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { isPostgrestMissingTableError } from '@/lib/crmSchemaError';
import {
  CALL_INVITE_LINE_HTML,
  DEFAULT_TEMPLATES,
  elvoriaBrandLink,
  LEGACY_CALL_INVITE_LINE,
} from '@/lib/emailMarketing/defaults';
import { ELVORIA_WEBSITE_URL } from '@/lib/emailMarketing/constants';
import type {
  EmailCampaign,
  EmailRecipient,
  EmailSendLog,
  EmailTemplate,
  EmailTemplateType,
  RecipientStatus,
} from '@/lib/emailMarketing/types';

export class EmailMarketingNotConfiguredError extends Error {
  constructor() {
    super('Email marketing requires Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
    this.name = 'EmailMarketingNotConfiguredError';
  }
}

export class EmailMarketingSchemaNotAppliedError extends Error {
  constructor() {
    super('Email marketing tables missing. Run supabase/email_marketing_schema.sql in Supabase SQL Editor.');
    this.name = 'EmailMarketingSchemaNotAppliedError';
  }
}

function requireSb() {
  if (!isSupabaseConfigured()) throw new EmailMarketingNotConfiguredError();
  return createAdminClient();
}

function throwIfDb(error: unknown): void {
  if (!error) return;
  if (isPostgrestMissingTableError(error)) throw new EmailMarketingSchemaNotAppliedError();
  throw error;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailMarketingReady(): boolean {
  return isSupabaseConfigured();
}

export async function isEmailMarketingSchemaApplied(): Promise<boolean> {
  if (!isEmailMarketingReady()) return false;
  const { error } = await createAdminClient().from('em_templates').select('template_type').limit(1);
  if (error && isPostgrestMissingTableError(error)) return false;
  return !error;
}

type DbTemplate = {
  template_type: EmailTemplateType;
  subject: string;
  body_html: string;
  updated_at: string;
};

type DbRecipient = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  industry: string;
  notes: string;
  status: RecipientStatus;
  auto_follow_up: boolean;
  initial_sent_at: string | null;
  follow_up_1_sent_at: string | null;
  follow_up_2_sent_at: string | null;
  replied_at: string | null;
  last_template_type: EmailTemplateType | null;
  created_at: string;
  updated_at: string;
};

function mapRecipient(r: DbRecipient): EmailRecipient {
  return {
    id: r.id,
    companyName: r.company_name,
    contactName: r.contact_name,
    email: r.email,
    industry: r.industry,
    notes: r.notes,
    status: r.status,
    autoFollowUp: r.auto_follow_up,
    initialSentAt: r.initial_sent_at,
    followUp1SentAt: r.follow_up_1_sent_at,
    followUp2SentAt: r.follow_up_2_sent_at,
    repliedAt: r.replied_at,
    lastTemplateType: r.last_template_type,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Subjects shipped before May 2026 — upgraded automatically on next template load. */
const LEGACY_TEMPLATE_SUBJECTS: Partial<Record<EmailTemplateType, string[]>> = {
  initial: [
    'Elvoria Tech — software development for [Company Name]',
    'Elvoria Tech - software development for [Company Name]',
    'Partnership opportunity for [Company Name] — Elvoria Tech',
  ],
  follow_up_1: ['Following up — Elvoria Tech'],
  follow_up_2: ['Final follow-up — Elvoria Tech'],
};

/** Add website link to the call-invite line on saved initial templates. */
/** Replace plain-text initial template with formatted headings and lists. */
async function syncLegacyInitialBodyFormat(sb: ReturnType<typeof createAdminClient>): Promise<void> {
  const { data, error } = await sb
    .from('em_templates')
    .select('body_html')
    .eq('template_type', 'initial')
    .maybeSingle();
  throwIfDb(error);
  if (!data) return;

  const body = (data as { body_html: string }).body_html;
  if (!body.includes('Our core expertise includes')) return;
  if (body.includes('<h3') && body.includes('<ul>')) return;

  const { error: updErr } = await sb
    .from('em_templates')
    .update({
      body_html: DEFAULT_TEMPLATES.initial.bodyHtml,
      updated_at: new Date().toISOString(),
    })
    .eq('template_type', 'initial');
  throwIfDb(updErr);
}

/** Python on backend line, linked Elvoria Tech / Team in saved templates. */
async function syncTemplateContentPatches(sb: ReturnType<typeof createAdminClient>): Promise<void> {
  const { data, error } = await sb.from('em_templates').select('template_type, body_html');
  throwIfDb(error);
  const brandLinked = elvoriaBrandLink();
  const teamLinked = elvoriaBrandLink('Elvoria Tech Team');
  const now = new Date().toISOString();

  for (const row of data || []) {
    let body = (row as { body_html: string; template_type: EmailTemplateType }).body_html;
    const type = (row as { template_type: EmailTemplateType }).template_type;
    let changed = false;

    if (body.includes('Spring Boot</li>') && !body.includes('Python</li>') && !body.includes(', Python')) {
      body = body.replace(
        /Node\.js, Java, Spring Boot<\/li>/g,
        'Node.js, Java, Spring Boot, Python</li>'
      );
      changed = true;
    }

    if (body.includes('<strong>Elvoria Tech Team</strong>') && !body.includes(teamLinked)) {
      body = body.replace(/<strong>Elvoria Tech Team<\/strong>/g, teamLinked);
      changed = true;
    }

    if (type === 'initial' && body.includes('<strong>Elvoria Tech</strong>') && !body.includes(brandLinked)) {
      body = body.replace(/<strong>Elvoria Tech<\/strong>/g, brandLinked);
      changed = true;
    }

    if (!changed) continue;
    const { error: updErr } = await sb
      .from('em_templates')
      .update({ body_html: body, updated_at: now })
      .eq('template_type', type);
    throwIfDb(updErr);
  }
}

async function syncLegacyCallInviteLink(sb: ReturnType<typeof createAdminClient>): Promise<void> {
  const { data, error } = await sb
    .from('em_templates')
    .select('body_html')
    .eq('template_type', 'initial')
    .maybeSingle();
  throwIfDb(error);
  if (!data) return;

  let body = (data as { body_html: string }).body_html;
  if (body.includes(CALL_INVITE_LINE_HTML) || !body.includes('minute call')) return;

  const linkedParagraph = `<p>${CALL_INVITE_LINE_HTML}</p>`;
  const replacements: Array<[string, string]> = [
    [`<p>${LEGACY_CALL_INVITE_LINE}</p>`, linkedParagraph],
    [`<p>${LEGACY_CALL_INVITE_LINE.replace('–', '-')}</p>`, linkedParagraph],
    [LEGACY_CALL_INVITE_LINE, CALL_INVITE_LINE_HTML],
    [LEGACY_CALL_INVITE_LINE.replace('–', '-'), CALL_INVITE_LINE_HTML],
  ];

  for (const [from, to] of replacements) {
    if (body.includes(from)) {
      body = body.split(from).join(to);
      break;
    }
  }

  if (body === (data as { body_html: string }).body_html) return;

  const { error: updErr } = await sb
    .from('em_templates')
    .update({ body_html: body, updated_at: new Date().toISOString() })
    .eq('template_type', 'initial');
  throwIfDb(updErr);
}

async function syncLegacyTemplateSubjects(sb: ReturnType<typeof createAdminClient>): Promise<void> {
  const now = new Date().toISOString();
  for (const type of Object.keys(LEGACY_TEMPLATE_SUBJECTS) as EmailTemplateType[]) {
    const legacy = LEGACY_TEMPLATE_SUBJECTS[type];
    if (!legacy?.length) continue;
    const nextSubject = DEFAULT_TEMPLATES[type].subject;
    const { error } = await sb
      .from('em_templates')
      .update({ subject: nextSubject, updated_at: now })
      .eq('template_type', type)
      .in('subject', legacy);
    throwIfDb(error);
  }
}

export async function ensureDefaultTemplates(): Promise<void> {
  const sb = requireSb();
  const { data, error } = await sb.from('em_templates').select('template_type');
  throwIfDb(error);
  const existing = new Set((data || []).map((r) => (r as { template_type: EmailTemplateType }).template_type));
  const toInsert = (Object.keys(DEFAULT_TEMPLATES) as EmailTemplateType[])
    .filter((t) => !existing.has(t))
    .map((t) => ({
      template_type: t,
      subject: DEFAULT_TEMPLATES[t].subject,
      body_html: DEFAULT_TEMPLATES[t].bodyHtml,
    }));
  if (toInsert.length) {
    const { error: insErr } = await sb.from('em_templates').insert(toInsert);
    throwIfDb(insErr);
  }
  await syncLegacyTemplateSubjects(sb);
  await syncLegacyInitialBodyFormat(sb);
  await syncLegacyCallInviteLink(sb);
  await syncTemplateContentPatches(sb);
}

export async function listTemplates(): Promise<EmailTemplate[]> {
  await ensureDefaultTemplates();
  const { data, error } = await requireSb()
    .from('em_templates')
    .select('*')
    .order('template_type');
  throwIfDb(error);
  return ((data || []) as DbTemplate[]).map((t) => ({
    templateType: t.template_type,
    subject: t.subject,
    bodyHtml: t.body_html,
    updatedAt: t.updated_at,
  }));
}

export async function getTemplate(type: EmailTemplateType): Promise<EmailTemplate | null> {
  await ensureDefaultTemplates();
  const { data, error } = await requireSb()
    .from('em_templates')
    .select('*')
    .eq('template_type', type)
    .maybeSingle();
  throwIfDb(error);
  if (!data) return null;
  const t = data as DbTemplate;
  return {
    templateType: t.template_type,
    subject: t.subject,
    bodyHtml: t.body_html,
    updatedAt: t.updated_at,
  };
}

/** Restore one template from built-in factory defaults (does not affect other types). */
export async function resetTemplateToDefault(type: EmailTemplateType): Promise<EmailTemplate> {
  const def = DEFAULT_TEMPLATES[type];
  return updateTemplate(type, { subject: def.subject, bodyHtml: def.bodyHtml });
}

export function getDefaultTemplateSnapshot(type: EmailTemplateType): {
  subject: string;
  bodyHtml: string;
} {
  return { ...DEFAULT_TEMPLATES[type] };
}

export async function updateTemplate(
  type: EmailTemplateType,
  patch: { subject: string; bodyHtml: string }
): Promise<EmailTemplate> {
  const { data, error } = await requireSb()
    .from('em_templates')
    .update({
      subject: patch.subject.slice(0, 500),
      body_html: patch.bodyHtml.slice(0, 100_000),
      updated_at: new Date().toISOString(),
    })
    .eq('template_type', type)
    .select('*')
    .single();
  throwIfDb(error);
  const t = data as DbTemplate;
  return {
    templateType: t.template_type,
    subject: t.subject,
    bodyHtml: t.body_html,
    updatedAt: t.updated_at,
  };
}

export async function listRecipients(): Promise<EmailRecipient[]> {
  const { data, error } = await requireSb()
    .from('em_recipients')
    .select('*')
    .order('created_at', { ascending: false });
  throwIfDb(error);
  return ((data || []) as DbRecipient[]).map(mapRecipient);
}

export async function createRecipient(input: {
  companyName: string;
  contactName: string;
  email: string;
  industry: string;
  notes: string;
}): Promise<EmailRecipient> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error('Invalid email address');
  const { data, error } = await requireSb()
    .from('em_recipients')
    .insert({
      company_name: input.companyName.trim().slice(0, 200),
      contact_name: input.contactName.trim().slice(0, 120),
      email,
      industry: input.industry.trim().slice(0, 120),
      notes: input.notes.trim().slice(0, 2000),
    })
    .select('*')
    .single();
  throwIfDb(error);
  return mapRecipient(data as DbRecipient);
}

export async function deleteRecipient(id: string): Promise<boolean> {
  const { data, error } = await requireSb().from('em_recipients').delete().eq('id', id).select('id');
  throwIfDb(error);
  return Boolean(data?.length);
}

export async function markRecipientReplied(id: string): Promise<void> {
  const { error } = await requireSb()
    .from('em_recipients')
    .update({
      status: 'replied',
      replied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  throwIfDb(error);
}

export async function upsertRecipientsFromRows(
  rows: Array<{ contactName: string; email: string; companyName: string; industry: string }>
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const sb = requireSb();
  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      errors.push(`Skipped invalid email: ${row.email || '(empty)'}`);
      skipped++;
      continue;
    }
    const { error } = await sb.from('em_recipients').insert({
      email,
      company_name: row.companyName.trim().slice(0, 200),
      contact_name: row.contactName.trim().slice(0, 120),
      industry: row.industry.trim().slice(0, 120),
    });
    if (error) {
      if (error.code === '23505') {
        skipped++;
        continue;
      }
      errors.push(`${email}: ${error.message}`);
      skipped++;
    } else {
      inserted++;
    }
  }
  return { inserted, skipped, errors };
}

export async function getRecipientsByIds(ids: string[]): Promise<EmailRecipient[]> {
  if (!ids.length) return [];
  const { data, error } = await requireSb().from('em_recipients').select('*').in('id', ids);
  throwIfDb(error);
  return ((data || []) as DbRecipient[]).map(mapRecipient);
}

export async function createCampaign(meta: {
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
}): Promise<string> {
  const { data, error } = await requireSb()
    .from('em_campaigns')
    .insert({
      template_type: meta.templateType,
      auto_follow_up: meta.autoFollowUp,
      recipient_count: meta.recipientCount,
      sent_count: meta.sentCount,
      failed_count: meta.failedCount,
    })
    .select('id')
    .single();
  throwIfDb(error);
  return (data as { id: string }).id;
}

export async function appendSendLog(entry: {
  campaignId: string;
  recipientId: string;
  templateType: EmailTemplateType;
  email: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}): Promise<void> {
  const { error } = await requireSb().from('em_send_logs').insert({
    campaign_id: entry.campaignId,
    recipient_id: entry.recipientId,
    template_type: entry.templateType,
    email: entry.email,
    status: entry.status,
    error_message: entry.errorMessage?.slice(0, 2000) || '',
  });
  throwIfDb(error);
}

export async function updateRecipientAfterSend(
  recipientId: string,
  templateType: EmailTemplateType,
  opts: { autoFollowUp: boolean; success: boolean }
): Promise<void> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    updated_at: now,
    last_template_type: templateType,
  };
  if (opts.success) {
    patch.status = 'sent';
    if (templateType === 'initial') {
      patch.initial_sent_at = now;
      patch.auto_follow_up = opts.autoFollowUp;
    } else if (templateType === 'follow_up_1') {
      patch.follow_up_1_sent_at = now;
    } else if (templateType === 'follow_up_2') {
      patch.follow_up_2_sent_at = now;
    }
  }
  const { error } = await requireSb().from('em_recipients').update(patch).eq('id', recipientId);
  throwIfDb(error);
}

export async function listSendLogs(limit = 100): Promise<EmailSendLog[]> {
  const { data, error } = await requireSb()
    .from('em_send_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(limit);
  throwIfDb(error);
  return ((data || []) as Array<{
    id: string;
    campaign_id: string | null;
    recipient_id: string | null;
    template_type: EmailTemplateType;
    email: string;
    status: 'sent' | 'failed';
    error_message: string;
    sent_at: string;
  }>).map((l) => ({
    id: l.id,
    campaignId: l.campaign_id,
    recipientId: l.recipient_id,
    templateType: l.template_type,
    email: l.email,
    status: l.status,
    errorMessage: l.error_message,
    sentAt: l.sent_at,
  }));
}

export async function listCampaigns(limit = 50): Promise<EmailCampaign[]> {
  const { data, error } = await requireSb()
    .from('em_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  throwIfDb(error);
  return ((data || []) as Array<{
    id: string;
    template_type: EmailTemplateType;
    auto_follow_up: boolean;
    recipient_count: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
  }>).map((c) => ({
    id: c.id,
    templateType: c.template_type,
    autoFollowUp: c.auto_follow_up,
    recipientCount: c.recipient_count,
    sentCount: c.sent_count,
    failedCount: c.failed_count,
    createdAt: c.created_at,
  }));
}

/** Recipients eligible for automated follow-ups. */
export async function listRecipientsForAutoFollowUp(): Promise<{
  followUp1: EmailRecipient[];
  followUp2: EmailRecipient[];
}> {
  const all = await listRecipients();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const followUp1 = all.filter((r) => {
    if (!r.autoFollowUp || r.status === 'replied' || r.repliedAt) return false;
    if (!r.initialSentAt || r.followUp1SentAt) return false;
    return now - new Date(r.initialSentAt).getTime() >= 3 * day;
  });

  const followUp2 = all.filter((r) => {
    if (!r.autoFollowUp || r.status === 'replied' || r.repliedAt) return false;
    if (!r.followUp1SentAt || r.followUp2SentAt) return false;
    const base = r.followUp1SentAt || r.initialSentAt;
    if (!base) return false;
    return now - new Date(base).getTime() >= 5 * day;
  });

  return { followUp1, followUp2 };
}
