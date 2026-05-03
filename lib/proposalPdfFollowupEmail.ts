import { escapeHtmlEmail, renderElvoriaEmailShell } from '@/lib/emailShell';
import { sendSiteHtmlEmail } from '@/lib/siteMailer';

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
  const contact = (opts.replyTo || process.env.SMTP_TO || process.env.CONTACT_EMAIL || '').trim();
  const name = opts.visitorName.trim() || 'there';
  const safeName = escapeHtmlEmail(name);
  const safeCompany = escapeHtmlEmail(company);
  const safeSite = escapeHtmlEmail(site);
  const safeContact = escapeHtmlEmail(contact);
  const logoUrl = `${site}/elvoria.png`;
  const safeLogo = escapeHtmlEmail(logoUrl);

  const previewPath = `/api/proposal/version/${encodeURIComponent(opts.versionId)}/preview?token=${encodeURIComponent(opts.downloadToken)}`;
  const previewUrl = `${site}${previewPath}`;
  const safePreviewUrl = escapeHtmlEmail(previewUrl);

  const subject = `${company} — your technical proposal (read online)`;
  const contentHtml = `
          <div class="h1" style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 10px 0;">Your proposal is ready to view</div>
          <div class="p" style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 14px 0;">
            Hi ${safeName},
          </div>
          <div class="p" style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 16px 0;">
            Your technical proposal was generated in our <strong style="color:#f8fafc;">AI proposal assistant</strong>.
            The automatic <strong style="color:#f8fafc;">PDF file</strong> could not be created on our server this time (often a temporary rendering or packaging issue).
            Your full text is saved securely on our side.
          </div>

          <div style="margin:0 0 18px 0;">
            <a href="${safePreviewUrl}" style="display:inline-block;background:linear-gradient(90deg,#06b6d4,#3b82f6);color:#04131a;text-decoration:none;font-weight:800;font-size:14px;padding:12px 18px;border-radius:12px;">
              Open proposal in browser
            </a>
          </div>

          <div class="p" style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 14px 0;">
            <strong style="color:#f8fafc;">What happens next</strong>
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:rgba(2,6,23,0.55);border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;margin:0 0 16px 0;">
            <tr>
              <td style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">Read online</div>
                <div style="font-size:13px;color:#e5e7eb;line-height:1.6;">Use the button above anytime. Keep this email — the link includes a private access token.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">PDF by email</div>
                <div style="font-size:13px;color:#e5e7eb;line-height:1.6;">Our team can email you the official PDF. If you do not receive it within one business day, check spam or reach out below.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 14px;">
                <div style="font-size:12px;color:#94a3b8;">Contact</div>
                <div style="font-size:13px;color:#e5e7eb;line-height:1.6;">
                  ${
                    contact
                      ? `Reply to this message or write to <a href="mailto:${safeContact}" style="color:#67e8f9;text-decoration:none;">${safeContact}</a> and mention <strong style="color:#f8fafc;">proposal PDF</strong>.`
                      : `Visit <a href="${safeSite}" style="color:#67e8f9;text-decoration:none;">${safeSite}</a> and use the contact options there.`
                  }
                </div>
              </td>
            </tr>
          </table>

          <div class="p" style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;">
            Plain link (if the button does not open):<br/>
            <span style="word-break:break-all;color:#cbd5e1;">${safePreviewUrl}</span>
          </div>

          <div style="margin-top:16px;font-size:12px;color:#94a3b8;line-height:1.6;">
            Best regards,<br/>
            <span style="color:#e5e7eb;font-weight:700;">${safeCompany}</span>
          </div>`;

  const html = renderElvoriaEmailShell({
    title: subject,
    preheader: 'Open your AI-generated technical proposal in the browser while we prepare your PDF.',
    showTimestamp: true,
    logoImgSrc: safeLogo,
    footerNoteHtml:
      'You are receiving this because you finalized a proposal in the AI assistant on our website. This message is transactional, not marketing.',
    contentHtml,
  });

  const r = await sendSiteHtmlEmail({ to: opts.to, subject, html });
  if (r.sent) return { sent: true };
  return {
    sent: false as const,
    reason: r.reason,
    detail: r.reason === 'send_failed' ? r.detail : undefined,
  };
}
