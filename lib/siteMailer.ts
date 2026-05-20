import nodemailer from 'nodemailer';
import type { Attachment } from 'nodemailer/lib/mailer';

type MailKit =
  | { ok: true; transporter: nodemailer.Transporter; from: string }
  | { ok: false };

export function createSiteMailer(): MailKit {
  const emailService = process.env.EMAIL_SERVICE;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPortRaw = process.env.SMTP_PORT;
  const smtpPort = smtpPortRaw ? Number.parseInt(smtpPortRaw.trim(), 10) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM;

  const hasSmtp = Boolean(smtpHost && smtpPort && smtpUser && smtpPassword);
  const hasService = Boolean(emailService && emailUser && emailPassword);
  if (!hasSmtp && !hasService) return { ok: false };

  const transporter = hasSmtp
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPassword },
      })
    : nodemailer.createTransport({
        service: emailService,
        auth: { user: emailUser, pass: emailPassword },
      });
  const from = (smtpFrom || smtpUser || emailUser || '').trim();
  if (!from) return { ok: false };
  return { ok: true, transporter, from };
}

export async function sendSiteHtmlEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
}): Promise<{ sent: true } | { sent: false; reason: 'not_configured' | 'send_failed'; detail?: string }> {
  const kit = createSiteMailer();
  if (!kit.ok) return { sent: false, reason: 'not_configured' };
  try {
    await kit.transporter.sendMail({
      from: kit.from,
      to: params.to,
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

/** Turn SMTP auth failures into actionable setup hints for the admin UI. */
export function formatMailSendError(detail: string): string {
  const lower = detail.toLowerCase();
  if (
    lower.includes('535') ||
    lower.includes('badcredentials') ||
    lower.includes('username and password not accepted') ||
    lower.includes('eauth')
  ) {
    return (
      'Gmail SMTP login rejected (535). Use a Google App Password — not your normal Gmail password — ' +
      'with 2-Step Verification enabled. Set SMTP_USER (or EMAIL_USER) to the full mailbox address ' +
      '(e.g. contact@elvoriatech.com). If both SMTP_* and EMAIL_* are set, SMTP_* is used. ' +
      'Restart the server after changing .env. See https://support.google.com/mail/?p=BadCredentials'
    );
  }
  return detail;
}
