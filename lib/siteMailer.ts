import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type { Attachment } from 'nodemailer/lib/mailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import { appendToSentFolder, isImapSentCopyEnabled } from '@/lib/imapSentCopy';

type MailKit =
  | { ok: true; transporter: nodemailer.Transporter; from: string }
  | { ok: false };

/** Google app passwords are often pasted as "abcd efgh ijkl mnop" — Gmail expects no spaces. */
export function normalizeMailPassword(value: string | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, '');
}

/** Inbound / footer contact address (not used for SMTP auth). */
export function getContactEmail(): string {
  return process.env.CONTACT_EMAIL?.trim() || 'contact@elvoria.tech';
}

/**
 * BCC address for campaign sends so the sending mailbox gets a copy of each outbound message.
 * Set EMAIL_CAMPAIGN_BCC=false to disable. Defaults to EMAIL_USER when unset.
 */
export function getCampaignSentCopyBcc(): string | undefined {
  const raw = process.env.EMAIL_CAMPAIGN_BCC?.trim();
  if (raw && /^false$/i.test(raw)) return undefined;
  if (raw && !/^false$/i.test(raw)) return raw;
  return process.env.EMAIL_USER?.trim() || undefined;
}

function formatFromAddress(user: string): string {
  const addr = user.trim();
  if (!addr) return addr;
  if (addr.includes('<')) return addr;
  const name = (process.env.COMPANY_NAME || 'Elvoria Technologies').trim();
  return name ? `${name} <${addr}>` : addr;
}

/**
 * Single mail config for the whole app.
 * Preferred (custom SMTP, e.g. IONOS): EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD.
 * Fallback (well-known provider): EMAIL_SERVICE (e.g. 'gmail'), EMAIL_USER, EMAIL_PASSWORD.
 * (+ CONTACT_EMAIL for recipients.)
 */
export function createSiteMailer(): MailKit {
  const emailHost = process.env.EMAIL_HOST?.trim();
  const emailService = process.env.EMAIL_SERVICE?.trim();
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPassword = normalizeMailPassword(process.env.EMAIL_PASSWORD);

  if (!emailUser || !emailPassword || (!emailHost && !emailService)) {
    return { ok: false };
  }

  const port = Number(process.env.EMAIL_PORT?.trim() || 587);
  const transporter = nodemailer.createTransport(
    emailHost
      ? {
          host: emailHost,
          port,
          secure: port === 465, // 465 = implicit SSL, 587 = STARTTLS
          auth: { user: emailUser, pass: emailPassword },
        }
      : {
          service: emailService,
          auth: { user: emailUser, pass: emailPassword },
        }
  );

  return { ok: true, transporter, from: formatFromAddress(emailUser) };
}

export function isSiteMailConfigured(): boolean {
  return createSiteMailer().ok;
}

/** Test login without sending mail (admin diagnostics). */
export async function verifySiteMailer(): Promise<
  | { ok: true; from: string; service: string }
  | { ok: false; reason: 'not_configured' | 'auth_failed'; detail: string }
> {
  const kit = createSiteMailer();
  if (!kit.ok) {
    return {
      ok: false,
      reason: 'not_configured',
      detail: 'Set EMAIL_USER, EMAIL_PASSWORD, and EMAIL_HOST (or EMAIL_SERVICE) in .env.local',
    };
  }
  try {
    await kit.transporter.verify();
    return {
      ok: true,
      from: kit.from,
      service: process.env.EMAIL_HOST?.trim() || process.env.EMAIL_SERVICE?.trim() || 'unknown',
    };
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: 'auth_failed', detail: formatMailSendError(raw) };
  }
}

export async function sendSiteHtmlEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
  replyTo?: string;
  /** e.g. your mailbox — one copy per message in Sent/BCC */
  bcc?: string | string[];
}): Promise<{ sent: true } | { sent: false; reason: 'not_configured' | 'send_failed'; detail?: string }> {
  const kit = createSiteMailer();
  if (!kit.ok) return { sent: false, reason: 'not_configured' };

  const mailOptions: Mail.Options = {
    from: kit.from,
    to: params.to,
    bcc: params.bcc,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    text:
      params.text ??
      params.html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    attachments: params.attachments,
    date: new Date(),
  };

  try {
    const info = await kit.transporter.sendMail(mailOptions);
    await saveCopyToSentFolder(mailOptions, info.messageId);
    return { sent: true };
  } catch (e) {
    console.error('[siteMailer] send failed:', e);
    const raw = e instanceof Error ? e.message : String(e);
    return { sent: false, reason: 'send_failed', detail: formatMailSendError(raw) };
  }
}

/**
 * Best-effort: append a copy of the just-sent message to the mailbox "Sent" folder
 * via IMAP. Never throws — a failure here must not affect delivery. The saved copy
 * drops Bcc so it mirrors what the recipient sees.
 */
async function saveCopyToSentFolder(mailOptions: Mail.Options, messageId?: string): Promise<void> {
  if (!isImapSentCopyEnabled()) return;
  try {
    const raw: Buffer = await new Promise((resolve, reject) => {
      new MailComposer({ ...mailOptions, bcc: undefined, messageId }).compile().build((err, message) => {
        if (err) reject(err);
        else resolve(message);
      });
    });
    await appendToSentFolder(raw);
  } catch (err) {
    console.warn(
      '[siteMailer] could not save copy to Sent folder:',
      err instanceof Error ? err.message : err
    );
  }
}

export function formatMailSendError(detail: string): string {
  const lower = detail.toLowerCase();
  const isAuthError =
    lower.includes('535') ||
    lower.includes('534') ||
    lower.includes('badcredentials') ||
    lower.includes('username and password not accepted') ||
    lower.includes('eauth');
  if (!isAuthError) return detail;

  // Gmail-specific guidance (app password) when using the gmail service / gsmtp host.
  if (lower.includes('gsmtp') || process.env.EMAIL_SERVICE?.trim() === 'gmail') {
    return (
      'Gmail login rejected. Use a Google App Password in EMAIL_PASSWORD ' +
      '(https://myaccount.google.com/apppasswords). EMAIL_USER must match that mailbox. Restart the server after changing .env.'
    );
  }
  return (
    'SMTP login rejected. Check EMAIL_USER (full mailbox address), EMAIL_PASSWORD, ' +
    'EMAIL_HOST, and EMAIL_PORT. Restart the server after changing .env. Detail: ' +
    detail
  );
}
