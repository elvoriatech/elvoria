import { escapeHtml } from '@/lib/emailMarketing/emailLayout';
import { getContactEmail, sendSiteHtmlEmail } from '@/lib/siteMailer';
import {
  buildVisitorAutoReplyHtml,
  visitorAutoReplyAttachments,
  visitorAutoReplyInfoBox,
  visitorAutoReplyMailtoLink,
  visitorAutoReplySignOff,
} from '@/lib/visitorAutoReplyLayout';

const BODY_LINK = 'color:#0891b2;font-weight:600;text-decoration:underline;';

/** Email to the visitor when finalize succeeded but PDF rendering did not (e.g. Puppeteer / Mermaid path issue). */
export async function sendProposalPdfNotReadyVisitorEmail(opts: {
  to: string;
  visitorName: string;
  siteUrl: string;
  versionId: string;
  downloadToken: string;
  replyTo?: string;
  companyName?: string;
}): Promise<{ sent: true } | { sent: false; reason: string; detail?: string }> {
  const company = opts.companyName || process.env.COMPANY_NAME || 'Elvoria Tech';
  const site = opts.siteUrl.replace(/\/$/, '');
  const contact = (opts.replyTo || getContactEmail()).trim();
  const name = opts.visitorName.trim() || 'there';
  const safeName = escapeHtml(name);
  const safeCompany = escapeHtml(company);
  const safeSite = escapeHtml(site);

  const previewPath = `/api/proposal/version/${encodeURIComponent(opts.versionId)}/preview?token=${encodeURIComponent(opts.downloadToken)}`;
  const previewUrl = `${site}${previewPath}`;
  const safePreviewUrl = escapeHtml(previewUrl);

  const subject = `${company} — your technical proposal (read online)`;
  const contactLine = contact
    ? `Reply to this message or write to ${visitorAutoReplyMailtoLink(contact)} and mention <strong>proposal PDF</strong>.`
    : `Visit <a href="${safeSite}" style="${BODY_LINK}">${safeSite}</a> and use the contact options there.`;

  const bodyHtml = `<p>Hi ${safeName},</p>

<p>Your technical proposal was generated in our <strong>AI proposal assistant</strong>. The automatic <strong>PDF file</strong> could not be created on our server this time (often a temporary rendering issue). Your full text is saved securely on our side.</p>

<p><a href="${safePreviewUrl}" style="${BODY_LINK}">Open your proposal in the browser</a></p>

<h3 style="margin:22px 0 10px 0;font-size:15px;font-weight:700;color:#0f172a;line-height:1.35;">What happens next</h3>

${visitorAutoReplyInfoBox(
  'Read online',
  'Use the link above anytime. Keep this email — the link includes a private access token.'
)}

${visitorAutoReplyInfoBox(
  'PDF by email',
  'Our team can email you the official PDF. If you do not receive it within one business day, check spam or reach out below.'
)}

${visitorAutoReplyInfoBox('Contact', contactLine)}

<p style="font-size:13px;color:#64748b;line-height:1.6;">Plain link (if the button above does not open):<br />
<span style="word-break:break-all;color:#475569;">${safePreviewUrl}</span></p>

${visitorAutoReplySignOff()}`;

  const html = buildVisitorAutoReplyHtml(
    bodyHtml,
    'Open your AI-generated technical proposal in the browser while we prepare your PDF.'
  );

  const r = await sendSiteHtmlEmail({
    to: opts.to,
    subject,
    html,
    replyTo: contact || undefined,
    attachments: visitorAutoReplyAttachments(),
  });
  if (r.sent) return { sent: true };
  return {
    sent: false as const,
    reason: r.reason,
    detail: r.reason === 'send_failed' ? r.detail : undefined,
  };
}
