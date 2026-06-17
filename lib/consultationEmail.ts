import { getContactEmail, sendSiteHtmlEmail } from '@/lib/siteMailer';
import { marketingLogoUrl } from '@/lib/emailMarketing/emailLayout';
import { isVisitorAutoReplyEnabled } from '@/lib/visitorAckEmail';
import {
  buildVisitorAutoReplyHtml,
  visitorAutoReplyAttachments,
  visitorAutoReplyInfoBox,
  visitorAutoReplyMailtoLink,
  visitorAutoReplySignOff,
} from '@/lib/visitorAutoReplyLayout';

export function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderEmailShell(params: { title: string; preheader: string; contentHtml: string }) {
  const { title, preheader, contentHtml } = params;

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0b1220;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#0b1220;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;max-width:640px;">
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="display:flex;align-items:center;gap:12px;">
                        <img src="${marketingLogoUrl()}" alt="Elvoria Technologies" width="36" height="36" style="display:block;border-radius:10px;" />
                        <div>
                          <div style="font-size:14px;font-weight:700;letter-spacing:0.3px;color:#ffffff;">Elvoria Technologies</div>
                          <div style="font-size:12px;color:#94a3b8;">AI-First Digital &amp; Software Development Partner</div>
                        </div>
                      </div>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <div style="font-size:12px;color:#94a3b8;">${new Date().toLocaleString()}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background:linear-gradient(135deg, rgba(147,51,234,0.18), rgba(59,130,246,0.14));border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 20px 16px 20px;">
                ${contentHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:14px 4px 0 4px;">
                <div style="font-size:12px;color:#94a3b8;line-height:1.6;">
                  You’re receiving this email because a scheduling request was submitted on your website.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;
}

export type ConsultationEmailPayload = {
  name: string;
  email: string;
  company?: string;
  whenDisplay: string;
  notes?: string;
};

export async function sendConsultationEmails(payload: ConsultationEmailPayload) {
  const { name, email, company, whenDisplay, notes } = payload;
  const contactEmail = getContactEmail();

  const safeName = escapeHtml(String(name));
  const safeEmail = escapeHtml(String(email));
  const safeCompany = escapeHtml(String(company || 'Not provided'));
  const safeWhen = escapeHtml(whenDisplay);
  const safeNotes = escapeHtml(String(notes || '')).replace(/\n/g, '<br>') || '—';

  const staff = await sendSiteHtmlEmail({
    to: contactEmail,
    replyTo: email,
    subject: `New consultation request — ${name}`,
    html: renderEmailShell({
      title: 'New Consultation Request',
      preheader: `New consultation request from ${name}.`,
      contentHtml: `
          <div style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 10px 0;">New Consultation Request</div>
          <div style="font-size:13px;color:#cbd5e1;line-height:1.6;margin:0 0 14px 0;">
            A visitor requested a consultation. Reply to this email to coordinate the final meeting details.
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:rgba(2,6,23,0.55);border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">Name</div>
                <div style="font-size:14px;color:#ffffff;font-weight:700;">${safeName}</div>
              </td>
              <td style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">Email</div>
                <div style="font-size:14px;color:#ffffff;font-weight:700;">${safeEmail}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">Company</div>
                <div style="font-size:14px;color:#e5e7eb;">${safeCompany}</div>
              </td>
              <td style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">Preferred time</div>
                <div style="font-size:14px;color:#e5e7eb;">${safeWhen}</div>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px 14px;">
                <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Notes</div>
                <div style="font-size:14px;color:#e5e7eb;line-height:1.7;">${safeNotes}</div>
              </td>
            </tr>
          </table>

          <div style="margin-top:14px;">
            <a href="mailto:${encodeURIComponent(String(email))}" style="display:inline-block;background:linear-gradient(90deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 14px;border-radius:10px;">
              Reply to ${safeName}
            </a>
          </div>
        `,
    }),
  });
  if (!staff.sent) throw new Error(staff.detail || 'Failed to send consultation email to staff');

  if (isVisitorAutoReplyEnabled()) {
    const bodyHtml = `<p>Hi ${safeName},</p>

<p>Thank you for requesting a consultation with us. We’ll reply shortly to confirm your booking (or propose alternatives if needed).</p>

${visitorAutoReplyInfoBox('Preferred time', `<strong>${safeWhen}</strong>`)}

<p>Questions before we confirm? Contact us at ${visitorAutoReplyMailtoLink(contactEmail)}.</p>

${visitorAutoReplySignOff()}`;

    const visitor = await sendSiteHtmlEmail({
      to: email,
      replyTo: contactEmail,
      subject: 'Consultation request received — Elvoria Technologies',
      html: buildVisitorAutoReplyHtml(bodyHtml, 'Thanks — we’ll confirm a time shortly.'),
      attachments: visitorAutoReplyAttachments(),
    });
    if (!visitor.sent) throw new Error(visitor.detail || 'Failed to send consultation confirmation');
  }
}
