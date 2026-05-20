import { escapeHtml } from '@/lib/emailMarketing/emailLayout';
import { getContactEmail, sendSiteHtmlEmail } from '@/lib/siteMailer';
import {
  buildVisitorAutoReplyHtml,
  visitorAutoReplyAttachments,
  visitorAutoReplyInfoBox,
  visitorAutoReplyMailtoLink,
  visitorAutoReplySignOff,
} from '@/lib/visitorAutoReplyLayout';

/** When false, visitor acknowledgment emails are skipped (staff/internal mail still sends). */
export function isVisitorAutoReplyEnabled(): boolean {
  return String(process.env.SEND_AUTOREPLY ?? 'true').toLowerCase() !== 'false';
}

export type VisitorAckResult =
  | { sent: true }
  | { sent: false; skipped?: boolean; detail?: string };

export async function sendContactFormAutoReply(params: {
  name: string;
  email: string;
  message: string;
}): Promise<VisitorAckResult> {
  if (!isVisitorAutoReplyEnabled()) return { sent: false, skipped: true };

  const { name, email, message } = params;
  const contactEmail = getContactEmail();
  const companyName = process.env.COMPANY_NAME || 'Elvoria Tech';
  const safeName = escapeHtml(String(name));
  const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br>');

  const bodyHtml = `<p>Hi ${safeName},</p>

<p>Thank you for reaching out to <strong>${escapeHtml(companyName)}</strong>. We have received your message and appreciate your interest.</p>

<p>Our team will review your inquiry and get back to you as soon as possible, typically within <strong>24–48 hours</strong>.</p>

<p>If your request is urgent, please reply to this email.</p>

${visitorAutoReplyInfoBox('Your message', safeMessage || '—')}

<p>We look forward to assisting you.</p>

<p>Questions? Contact us at ${visitorAutoReplyMailtoLink(contactEmail)}.</p>

${visitorAutoReplySignOff()}`;

  const preheader = 'Thanks — we’ll get back to you shortly.';
  const auto = await sendSiteHtmlEmail({
    to: email,
    replyTo: contactEmail,
    subject: `Thank you for contacting ${companyName}`,
    html: buildVisitorAutoReplyHtml(bodyHtml, preheader),
    attachments: visitorAutoReplyAttachments(),
  });

  if (auto.sent) return { sent: true };
  return { sent: false, detail: auto.reason === 'send_failed' ? auto.detail : auto.reason };
}

export async function sendSupportLeadAutoReply(params: {
  fullName: string;
  email: string;
  company: string;
}): Promise<VisitorAckResult> {
  if (!isVisitorAutoReplyEnabled()) return { sent: false, skipped: true };

  const { fullName, email, company } = params;
  const contactEmail = getContactEmail();
  const companyName = process.env.COMPANY_NAME || 'Elvoria Tech';
  const safeName = escapeHtml(fullName);
  const safeCompany = escapeHtml(company);

  const bodyHtml = `<p>Hi ${safeName},</p>

<p>Thank you for connecting with <strong>${escapeHtml(companyName)}</strong>.</p>

<p>We saved your details for <strong>${safeCompany}</strong>. You can continue in our <strong>AI proposal chat</strong> on our website to shape your technical proposal.</p>

<p>When you finalize the proposal, we’ll prepare your document and our team may reach out to discuss next steps.</p>

<p>Questions? Reply to this email or contact us at ${visitorAutoReplyMailtoLink(contactEmail)}.</p>

${visitorAutoReplySignOff()}`;

  const preheader = 'Your AI proposal session is ready — we’ll follow up if needed.';
  const auto = await sendSiteHtmlEmail({
    to: email,
    replyTo: contactEmail,
    subject: `Thanks for connecting with ${companyName}`,
    html: buildVisitorAutoReplyHtml(bodyHtml, preheader),
    attachments: visitorAutoReplyAttachments(),
  });

  if (auto.sent) return { sent: true };
  return { sent: false, detail: auto.reason === 'send_failed' ? auto.detail : auto.reason };
}
