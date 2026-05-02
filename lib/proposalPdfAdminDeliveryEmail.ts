import { sendSiteHtmlEmail } from '@/lib/siteMailer';

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/** Email proposal PDF to visitor (attachment). Used from admin “Send PDF” action. */
export async function sendProposalPdfToVisitorFromAdmin(opts: {
  to: string;
  visitorName: string;
  pdfPath: string;
}): Promise<{ sent: true } | { sent: false; reason: string; detail?: string }> {
  const company = process.env.COMPANY_NAME || 'Elvoria Tech';
  const site = (process.env.SITE_URL || 'https://elvoriatech.com').replace(/\/$/, '');
  const name = opts.visitorName.trim() || 'there';
  const safeName = escapeHtml(name);
  const safeCompany = escapeHtml(company);
  const safeSite = escapeHtml(site);

  const subject = `${company} — your technical proposal (PDF)`;
  const html = `
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:24px;background:#0b1220;color:#e5e7eb;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;font-size:15px;">
  <p style="margin:0 0 16px;">Hi ${safeName},</p>
  <p style="margin:0 0 16px;">Please find your technical proposal attached as a PDF from <strong>${safeCompany}</strong>.</p>
  <p style="margin:0 0 16px;">If you have questions or want to move forward, reply to this email or visit <a href="${safeSite}" style="color:#22d3ee;">${safeSite}</a>.</p>
  <p style="margin:0;font-size:13px;color:#94a3b8;">— ${safeCompany}</p>
</body></html>`;

  return sendSiteHtmlEmail({
    to: opts.to,
    subject,
    html,
    attachments: [
      {
        filename: 'technical-proposal.pdf',
        path: opts.pdfPath,
        contentType: 'application/pdf',
      },
    ],
  });
}
