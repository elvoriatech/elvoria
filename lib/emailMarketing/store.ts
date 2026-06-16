import { getPool, isDbConfigured } from '@/lib/db';
import { isPostgrestMissingTableError } from '@/lib/crmSchemaError';
import {
  CALL_INVITE_LINE_HTML,
  DEFAULT_TEMPLATES,
  elvoriaBrandLink,
  LEGACY_CALL_INVITE_LINE,
} from '@/lib/emailMarketing/defaults';
import {
  RECIPIENT_IDS_CHUNK,
  RECIPIENTS_PAGE_SIZE,
} from '@/lib/emailMarketing/constants';
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
    super('Email marketing requires DATABASE_URL to be configured.');
    this.name = 'EmailMarketingNotConfiguredError';
  }
}

export class EmailMarketingSchemaNotAppliedError extends Error {
  constructor() {
    super('Email marketing tables missing. Run the email_marketing_schema.sql against your PostgreSQL database.');
    this.name = 'EmailMarketingSchemaNotAppliedError';
  }
}

function requireDb() {
  if (!isDbConfigured()) throw new EmailMarketingNotConfiguredError();
  return getPool();
}

function throwIfDb(error: unknown): void {
  if (!error) return;
  if (isPostgrestMissingTableError(error)) throw new EmailMarketingSchemaNotAppliedError();
  throw error;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailMarketingReady(): boolean {
  return isDbConfigured();
}

export async function isEmailMarketingSchemaApplied(): Promise<boolean> {
  if (!isEmailMarketingReady()) return false;
  try {
    await getPool().query('SELECT template_type FROM em_templates LIMIT 1');
    return true;
  } catch (e) {
    if (isPostgrestMissingTableError(e)) return false;
    return false;
  }
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

const LEGACY_TEMPLATE_SUBJECTS: Partial<Record<EmailTemplateType, string[]>> = {
  initial: [
    'Elvoria Tech — software development for [Company Name]',
    'Elvoria Tech - software development for [Company Name]',
    'Partnership opportunity for [Company Name] — Elvoria Tech',
  ],
  follow_up_1: ['Following up — Elvoria Tech'],
  follow_up_2: ['Final follow-up — Elvoria Tech'],
};

async function syncLegacyInitialBodyFormat(pool: ReturnType<typeof getPool>): Promise<void> {
  const { rows } = await pool.query<{ body_html: string }>(
    "SELECT body_html FROM em_templates WHERE template_type = 'initial' LIMIT 1"
  );
  if (!rows.length) return;
  const body = rows[0].body_html;
  if (!body.includes('Our core expertise includes')) return;
  if (body.includes('<h3') && body.includes('<ul>')) return;
  await pool.query(
    "UPDATE em_templates SET body_html = $1, updated_at = $2 WHERE template_type = 'initial'",
    [DEFAULT_TEMPLATES.initial.bodyHtml, new Date().toISOString()]
  );
}

async function syncTemplateContentPatches(pool: ReturnType<typeof getPool>): Promise<void> {
  const { rows } = await pool.query<{ template_type: EmailTemplateType; body_html: string }>(
    'SELECT template_type, body_html FROM em_templates'
  );
  const brandLinked = elvoriaBrandLink();
  const teamLinked = elvoriaBrandLink('Elvoria Tech Team');
  const now = new Date().toISOString();

  for (const row of rows) {
    let body = row.body_html;
    const type = row.template_type;
    let changed = false;

    if (body.includes('Spring Boot</li>') && !body.includes('Python</li>') && !body.includes(', Python')) {
      body = body.replace(/Node\.js, Java, Spring Boot<\/li>/g, 'Node.js, Java, Spring Boot, Python</li>');
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
    await pool.query(
      'UPDATE em_templates SET body_html = $1, updated_at = $2 WHERE template_type = $3',
      [body, now, type]
    );
  }
}

async function syncLegacyCallInviteLink(pool: ReturnType<typeof getPool>): Promise<void> {
  const { rows } = await pool.query<{ body_html: string }>(
    "SELECT body_html FROM em_templates WHERE template_type = 'initial' LIMIT 1"
  );
  if (!rows.length) return;
  let body = rows[0].body_html;
  if (body.includes(CALL_INVITE_LINE_HTML) || !body.includes('minute call')) return;

  const linkedParagraph = `<p>${CALL_INVITE_LINE_HTML}</p>`;
  const replacements: Array<[string, string]> = [
    [`<p>${LEGACY_CALL_INVITE_LINE}</p>`, linkedParagraph],
    [`<p>${LEGACY_CALL_INVITE_LINE.replace('–', '-')}</p>`, linkedParagraph],
    [LEGACY_CALL_INVITE_LINE, CALL_INVITE_LINE_HTML],
    [LEGACY_CALL_INVITE_LINE.replace('–', '-'), CALL_INVITE_LINE_HTML],
  ];
  for (const [from, to] of replacements) {
    if (body.includes(from)) { body = body.split(from).join(to); break; }
  }
  if (body === rows[0].body_html) return;
  await pool.query(
    "UPDATE em_templates SET body_html = $1, updated_at = $2 WHERE template_type = 'initial'",
    [body, new Date().toISOString()]
  );
}

async function syncLegacyTemplateSubjects(pool: ReturnType<typeof getPool>): Promise<void> {
  const now = new Date().toISOString();
  for (const type of Object.keys(LEGACY_TEMPLATE_SUBJECTS) as EmailTemplateType[]) {
    const legacy = LEGACY_TEMPLATE_SUBJECTS[type];
    if (!legacy?.length) continue;
    const placeholders = legacy.map((_, i) => `$${i + 3}`).join(', ');
    await pool.query(
      `UPDATE em_templates SET subject = $1, updated_at = $2 WHERE template_type = '${type}' AND subject IN (${placeholders})`,
      [DEFAULT_TEMPLATES[type].subject, now, ...legacy]
    );
  }
}

export async function ensureDefaultTemplates(): Promise<void> {
  const pool = requireDb();
  const { rows } = await pool.query<{ template_type: EmailTemplateType }>(
    'SELECT template_type FROM em_templates'
  );
  const existing = new Set(rows.map((r) => r.template_type));
  const toInsert = (Object.keys(DEFAULT_TEMPLATES) as EmailTemplateType[]).filter((t) => !existing.has(t));

  for (const t of toInsert) {
    await pool.query(
      'INSERT INTO em_templates (template_type, subject, body_html) VALUES ($1, $2, $3)',
      [t, DEFAULT_TEMPLATES[t].subject, DEFAULT_TEMPLATES[t].bodyHtml]
    );
  }

  await syncLegacyTemplateSubjects(pool);
  await syncLegacyInitialBodyFormat(pool);
  await syncLegacyCallInviteLink(pool);
  await syncTemplateContentPatches(pool);
}

export async function listTemplates(): Promise<EmailTemplate[]> {
  await ensureDefaultTemplates();
  const { rows } = await requireDb().query<DbTemplate>(
    'SELECT * FROM em_templates ORDER BY template_type'
  );
  return rows.map((t) => ({
    templateType: t.template_type,
    subject: t.subject,
    bodyHtml: t.body_html,
    updatedAt: t.updated_at,
  }));
}

export async function getTemplate(type: EmailTemplateType): Promise<EmailTemplate | null> {
  await ensureDefaultTemplates();
  const { rows } = await requireDb().query<DbTemplate>(
    'SELECT * FROM em_templates WHERE template_type = $1 LIMIT 1',
    [type]
  );
  if (!rows.length) return null;
  const t = rows[0];
  return { templateType: t.template_type, subject: t.subject, bodyHtml: t.body_html, updatedAt: t.updated_at };
}

export async function resetTemplateToDefault(type: EmailTemplateType): Promise<EmailTemplate> {
  const def = DEFAULT_TEMPLATES[type];
  return updateTemplate(type, { subject: def.subject, bodyHtml: def.bodyHtml });
}

export function getDefaultTemplateSnapshot(type: EmailTemplateType): { subject: string; bodyHtml: string } {
  return { ...DEFAULT_TEMPLATES[type] };
}

export async function updateTemplate(
  type: EmailTemplateType,
  patch: { subject: string; bodyHtml: string }
): Promise<EmailTemplate> {
  const now = new Date().toISOString();
  const { rows } = await requireDb().query<DbTemplate>(
    `UPDATE em_templates SET subject = $1, body_html = $2, updated_at = $3
     WHERE template_type = $4 RETURNING *`,
    [patch.subject.slice(0, 500), patch.bodyHtml.slice(0, 100_000), now, type]
  );
  throwIfDb(rows.length === 0 ? new Error('Template not found') : null);
  const t = rows[0];
  return { templateType: t.template_type, subject: t.subject, bodyHtml: t.body_html, updatedAt: t.updated_at };
}

export async function listRecipients(): Promise<EmailRecipient[]> {
  return listAllRecipients();
}

export type RecipientsPageResult = {
  recipients: EmailRecipient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listRecipientsPaginated(params: {
  page?: number;
  pageSize?: number;
  status?: RecipientStatus;
}): Promise<RecipientsPageResult> {
  const pageSize = Math.min(Math.max(params.pageSize ?? RECIPIENTS_PAGE_SIZE, 1), RECIPIENTS_PAGE_SIZE);
  const page = Math.max(params.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  const conditions = params.status ? `WHERE status = $3` : '';
  const countValues = params.status ? [params.status] : [];
  const dataValues = params.status ? [pageSize, offset, params.status] : [pageSize, offset];

  const { rows: countRows } = await requireDb().query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM em_recipients ${params.status ? 'WHERE status = $1' : ''}`,
    countValues
  );
  const total = parseInt(countRows[0].count, 10);

  const { rows } = await requireDb().query<DbRecipient>(
    `SELECT * FROM em_recipients ${conditions} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    dataValues
  );

  return {
    recipients: rows.map(mapRecipient),
    total,
    page,
    pageSize,
    totalPages: total ? Math.ceil(total / pageSize) : 0,
  };
}

export async function listAllRecipients(): Promise<EmailRecipient[]> {
  const { rows } = await requireDb().query<DbRecipient>(
    'SELECT * FROM em_recipients ORDER BY created_at DESC'
  );
  return rows.map(mapRecipient);
}

export async function countRecipientsByStatus(status: RecipientStatus): Promise<number> {
  const { rows } = await requireDb().query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM em_recipients WHERE status = $1',
    [status]
  );
  return parseInt(rows[0].count, 10);
}

export async function listRecipientIdsByStatus(status: RecipientStatus): Promise<string[]> {
  const { rows } = await requireDb().query<{ id: string }>(
    'SELECT id FROM em_recipients WHERE status = $1 ORDER BY created_at DESC',
    [status]
  );
  return rows.map((r) => r.id);
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
  const { rows } = await requireDb().query<DbRecipient>(
    `INSERT INTO em_recipients (company_name, contact_name, email, industry, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      input.companyName.trim().slice(0, 200),
      input.contactName.trim().slice(0, 120),
      email,
      input.industry.trim().slice(0, 120),
      input.notes.trim().slice(0, 2000),
    ]
  );
  return mapRecipient(rows[0]);
}

export async function deleteRecipient(id: string): Promise<boolean> {
  const { rowCount } = await requireDb().query(
    'DELETE FROM em_recipients WHERE id = $1',
    [id]
  );
  return Boolean(rowCount);
}

export async function markRecipientReplied(id: string): Promise<void> {
  const now = new Date().toISOString();
  await requireDb().query(
    "UPDATE em_recipients SET status = 'replied', replied_at = $1, updated_at = $2 WHERE id = $3",
    [now, now, id]
  );
}

export async function upsertRecipientsFromRows(
  rows: Array<{ contactName: string; email: string; companyName: string; industry: string }>
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const pool = requireDb();
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
    try {
      await pool.query(
        `INSERT INTO em_recipients (email, company_name, contact_name, industry)
         VALUES ($1, $2, $3, $4)`,
        [
          email,
          row.companyName.trim().slice(0, 200),
          row.contactName.trim().slice(0, 120),
          row.industry.trim().slice(0, 120),
        ]
      );
      inserted++;
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code === '23505') { skipped++; continue; }
      errors.push(`${email}: ${err.message ?? String(e)}`);
      skipped++;
    }
  }
  return { inserted, skipped, errors };
}

export async function getRecipientsByIds(ids: string[]): Promise<EmailRecipient[]> {
  if (!ids.length) return [];
  const unique = [...new Set(ids)];
  const pool = requireDb();
  const out: EmailRecipient[] = [];

  for (let i = 0; i < unique.length; i += RECIPIENT_IDS_CHUNK) {
    const chunk = unique.slice(i, i + RECIPIENT_IDS_CHUNK);
    const placeholders = chunk.map((_, j) => `$${j + 1}`).join(', ');
    const { rows } = await pool.query<DbRecipient>(
      `SELECT * FROM em_recipients WHERE id IN (${placeholders})`,
      chunk
    );
    out.push(...rows.map(mapRecipient));
  }
  return out;
}

export async function createCampaign(meta: {
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
}): Promise<string> {
  const { rows } = await requireDb().query<{ id: string }>(
    `INSERT INTO em_campaigns
       (template_type, auto_follow_up, recipient_count, sent_count, failed_count)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [meta.templateType, meta.autoFollowUp, meta.recipientCount, meta.sentCount, meta.failedCount]
  );
  return rows[0].id;
}

export async function appendSendLog(entry: {
  campaignId: string;
  recipientId: string;
  templateType: EmailTemplateType;
  email: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}): Promise<void> {
  await requireDb().query(
    `INSERT INTO em_send_logs
       (campaign_id, recipient_id, template_type, email, status, error_message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      entry.campaignId,
      entry.recipientId,
      entry.templateType,
      entry.email,
      entry.status,
      entry.errorMessage?.slice(0, 2000) || '',
    ]
  );
}

export async function updateRecipientAfterSend(
  recipientId: string,
  templateType: EmailTemplateType,
  opts: { autoFollowUp: boolean; success: boolean }
): Promise<void> {
  const now = new Date().toISOString();
  const sets: string[] = ['updated_at = $1', 'last_template_type = $2'];
  const values: unknown[] = [now, templateType];

  if (opts.success) {
    sets.push(`status = $${values.length + 1}`);
    values.push('sent');
    if (templateType === 'initial') {
      sets.push(`initial_sent_at = $${values.length + 1}`);
      values.push(now);
      sets.push(`auto_follow_up = $${values.length + 1}`);
      values.push(opts.autoFollowUp);
    } else if (templateType === 'follow_up_1') {
      sets.push(`follow_up_1_sent_at = $${values.length + 1}`);
      values.push(now);
    } else if (templateType === 'follow_up_2') {
      sets.push(`follow_up_2_sent_at = $${values.length + 1}`);
      values.push(now);
    }
  }

  values.push(recipientId);
  await requireDb().query(
    `UPDATE em_recipients SET ${sets.join(', ')} WHERE id = $${values.length}`,
    values
  );
}

export async function listSendLogs(limit = 500): Promise<EmailSendLog[]> {
  const { rows } = await requireDb().query<{
    id: string;
    campaign_id: string | null;
    recipient_id: string | null;
    template_type: EmailTemplateType;
    email: string;
    status: 'sent' | 'failed';
    error_message: string;
    sent_at: string;
  }>(
    'SELECT * FROM em_send_logs ORDER BY sent_at DESC LIMIT $1',
    [limit]
  );
  return rows.map((l) => ({
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
  const { rows } = await requireDb().query<{
    id: string;
    template_type: EmailTemplateType;
    auto_follow_up: boolean;
    recipient_count: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
  }>(
    'SELECT * FROM em_campaigns ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return rows.map((c) => ({
    id: c.id,
    templateType: c.template_type,
    autoFollowUp: c.auto_follow_up,
    recipientCount: c.recipient_count,
    sentCount: c.sent_count,
    failedCount: c.failed_count,
    createdAt: c.created_at,
  }));
}

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
