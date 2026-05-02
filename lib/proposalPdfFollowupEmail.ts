import { sendSiteHtmlEmail } from '@/lib/siteMailer';

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/** Email to the visitor when finalize succeeded but PDF rendering did not (e.g. Puppeteer failure). */
export async function sendProposalPdfNotReadyVisitorEmail(opts: {
  to: string;
  visitorName: string;
  siteUrl: string;
  replyTo?: string;
  companyName?: string;
}): Promise<{ sent: true } | { sent: false; reason: string; detail?: string }> {
  const company = opts.companyName || process.env.COMPANY_NAME || 'Elvoria Tech';
  const site = opts.siteUrl.replace(/\/$/, '');
  const contact = (opts.replyTo || process.env.SMTP_TO || process.env.CONTACT_EMAIL || '').trim();
  const name = opts.visitorName.trim() || 'there';
  const safeName = escapeHtml(name);
  const safeCompany = escapeHtml(company);
  const safeSite = escapeHtml(site);
  const safeContact = escapeHtml(contact);

  const subject = `${company} — your proposal PDF`;
  const html = `
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:24px;background:#0b1220;color:#e5e7eb;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;font-size:15px;">
  <p style="margin:0 0 16px;">Hi ${safeName},</p>
  <p style="margin:0 0 16px;">Your technical proposal was generated in our assistant, but <strong>the automatic PDF download could not be completed</strong> (usually a temporary server or rendering issue).</p>
  <p style="margin:0 0 16px;"><strong>What happens next</strong></p>
  <ul style="margin:0 0 16px;padding-left:20px;">
    <li>Your proposal content is saved on our side.</li>
    <li>You will receive <strong>another email shortly</strong> with the PDF attached once our team has sent it.</li>
    <li>If you do not see it within one business day, check spam or contact us using the details below.</li>
  </ul>
  ${
    contact
      ? `<p style="margin:0 0 16px;">Reply to this message or write to <a href="mailto:${safeContact}" style="color:#22d3ee;">${safeContact}</a> and mention “proposal PDF”.</p>`
      : `<p style="margin:0 0 16px;">Visit <a href="${safeSite}" style="color:#22d3ee;">${safeSite}</a> and use the contact options there.</p>`
  }
  <p style="margin:0;font-size:13px;color:#94a3b8;">— ${safeCompany}</p>
</body></html>`;

  const r = await sendSiteHtmlEmail({ to: opts.to, subject, html });
  if (r.sent) return { sent: true };
  return {
    sent: false as const,
    reason: r.reason,
    detail: r.reason === 'send_failed' ? r.detail : undefined,
  };
}
