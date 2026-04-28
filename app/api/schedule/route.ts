import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

function toPublicEmailError(error: unknown) {
  const e = error as { code?: string; responseCode?: number; message?: string };
  if (e?.code === 'EAUTH' || e?.responseCode === 535) {
    return {
      status: 500,
      message:
        'Email login failed (Gmail). Use a Google “App Password” (requires 2‑Step Verification) for EMAIL_PASSWORD, and ensure EMAIL_USER is the mailbox address. If this is not a Gmail/Workspace inbox, use SMTP settings instead.',
    };
  }
  return { status: 500, message: 'Failed to send scheduling request' };
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderEmailShell(params: { title: string; preheader: string; contentHtml: string }) {
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
                        <img src="cid:elvoria-mark" alt="" width="36" height="36" style="display:block;border-radius:10px;" />
                        <div>
                          <div style="font-size:14px;font-weight:700;letter-spacing:0.3px;color:#ffffff;">Elvoriatech</div>
                          <div style="font-size:12px;color:#94a3b8;">AI‑First Development Partner</div>
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

export async function POST(request: NextRequest) {
  const { name, email, company, preferredDate, preferredTime, timeZone, notes } = await request.json();

  if (!name || !email || !preferredDate || !preferredTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const emailService = process.env.EMAIL_SERVICE;
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM;
    const contactEmail = process.env.CONTACT_EMAIL || 'contact@elvoriatech.com';

    const hasSmtp = Boolean(smtpHost && smtpPort && smtpUser && smtpPassword);
    const hasService = Boolean(emailService && emailUser && emailPassword);

    if (!hasSmtp && !hasService) {
      return NextResponse.json(
        {
          error:
            'Email is not configured. Set either (EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD) or (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD) in your environment.',
        },
        { status: 500 }
      );
    }

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

    const fromAddress = smtpFrom || smtpUser || emailUser;

    const when = `${preferredDate} at ${preferredTime} (${timeZone || 'local time'})`;
    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safeCompany = escapeHtml(String(company || 'Not provided'));
    const safeWhen = escapeHtml(when);
    const safeNotes = escapeHtml(String(notes || '')).replace(/\n/g, '<br>') || '—';

    await transporter.sendMail({
      from: fromAddress,
      to: contactEmail,
      subject: `New consultation request — ${name}`,
      replyTo: email,
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
      attachments: [
        {
          filename: 'elvoria.png',
          path: `${process.cwd()}/public/elvoria.png`,
          cid: 'elvoria-mark',
        },
      ],
    });

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: 'Consultation request received - Elvoriatech',
      html: renderEmailShell({
        title: 'Consultation request received',
        preheader: 'Thanks — we’ll confirm a time shortly.',
        contentHtml: `
          <div style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 10px 0;">We received your request</div>
          <div style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 14px 0;">
            Hi ${safeName}, thanks for requesting a consultation. We’ll reply shortly to confirm a final time (or propose alternatives).
          </div>

          <div style="background:rgba(2,6,23,0.55);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Preferred time</div>
            <div style="font-size:14px;color:#e5e7eb;font-weight:700;">${safeWhen}</div>
          </div>

          <div style="font-size:12px;color:#94a3b8;line-height:1.7;margin-top:14px;">
            Contact: <a href="mailto:${escapeHtml(contactEmail)}" style="color:#93c5fd;text-decoration:none;">${escapeHtml(contactEmail)}</a>
          </div>
        `,
      }),
      attachments: [
        {
          filename: 'elvoria.png',
          path: `${process.cwd()}/public/elvoria.png`,
          cid: 'elvoria-mark',
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Schedule email error:', error);
    const pub = toPublicEmailError(error);
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }
}

