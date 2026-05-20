import nodemailer from 'nodemailer';
import type { Attachment } from 'nodemailer/lib/mailer';

type MailKit =
  | { ok: true; transporter: nodemailer.Transporter; from: string }
  | { ok: false };

/** Google app passwords are often pasted as "abcd efgh ijkl mnop" — Gmail expects no spaces. */
export function normalizeMailPassword(value: string | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, '');
}

/** Inbound / footer contact address (not used for SMTP auth). */
export function getContactEmail(): string {
  return process.env.CONTACT_EMAIL?.trim() || 'contact@elvoriatech.com';
}

function formatFromAddress(user: string): string {
  const addr = user.trim();
  if (!addr) return addr;
  if (addr.includes('<')) return addr;
  const name = (process.env.COMPANY_NAME || 'Elvoria Tech').trim();
  return name ? `${name} <${addr}>` : addr;
}

/**
 * Single mail config for the whole app:
 * EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD (+ CONTACT_EMAIL for recipients).
 */
export function createSiteMailer(): MailKit {
  const emailService = process.env.EMAIL_SERVICE?.trim();
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPassword = normalizeMailPassword(process.env.EMAIL_PASSWORD);

  if (!emailService || !emailUser || !emailPassword) {
    return { ok: false };
  }

  const transporter = nodemailer.createTransport({
    service: emailService,
    auth: { user: emailUser, pass: emailPassword },
  });

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
      detail: 'Set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD in .env.local',
    };
  }
  try {
    await kit.transporter.verify();
    return {
      ok: true,
      from: kit.from,
      service: process.env.EMAIL_SERVICE?.trim() || 'gmail',
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
}): Promise<{ sent: true } | { sent: false; reason: 'not_configured' | 'send_failed'; detail?: string }> {
  const kit = createSiteMailer();
  if (!kit.ok) return { sent: false, reason: 'not_configured' };
  try {
    await kit.transporter.sendMail({
      from: kit.from,
      to: params.to,
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
    });
    return { sent: true };
  } catch (e) {
    console.error('[siteMailer] send failed:', e);
    const raw = e instanceof Error ? e.message : String(e);
    return { sent: false, reason: 'send_failed', detail: formatMailSendError(raw) };
  }
}

export function formatMailSendError(detail: string): string {
  const lower = detail.toLowerCase();
  if (
    lower.includes('535') ||
    lower.includes('badcredentials') ||
    lower.includes('username and password not accepted') ||
    lower.includes('eauth')
  ) {
    return (
      'Gmail login rejected (535). Use a Google App Password in EMAIL_PASSWORD ' +
      '(https://myaccount.google.com/apppasswords). EMAIL_USER must match that mailbox. Restart npm run dev.'
    );
  }
  return detail;
}
