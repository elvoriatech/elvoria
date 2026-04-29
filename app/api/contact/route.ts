import fs from 'node:fs';
import path from 'node:path';
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
  const code = e?.code ? ` (${e.code})` : '';
  const msg = e?.message ? `: ${String(e.message)}` : '';
  return { status: 500, message: `Failed to send email${code}${msg}` };
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderEmailShell(params: {
  title: string;
  preheader: string;
  contentHtml: string;
  showTimestamp?: boolean;
}) {
  const { title, preheader, contentHtml, showTimestamp = true } = params;

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(title)}</title>
    <style>
      @media (max-width: 480px) {
        .container { padding: 20px 12px !important; }
        .card { padding: 16px !important; }
        .h1 { font-size: 18px !important; }
        .p { font-size: 13px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0b1220;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#0b1220;">
      <tr>
        <td align="center" class="container" style="padding:32px 16px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;max-width:640px;">
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="vertical-align:middle;padding-right:12px;">
                            <img src="cid:elvoria-mark" alt="" width="36" height="36" style="display:block;border-radius:10px;" />
                          </td>
                          <td style="vertical-align:middle;">
                            <div style="font-size:14px;font-weight:700;letter-spacing:0.3px;color:#ffffff;line-height:1.2;">
                              Elvoriatech
                            </div>
                            <div style="font-size:12px;color:#94a3b8;line-height:1.2;margin-top:2px;">
                              AI‑First Development Partner
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    ${
                      showTimestamp
                        ? `<td align="right" style="vertical-align:middle;">
                      <div style="font-size:12px;color:#94a3b8;">${new Date().toLocaleString()}</div>
                    </td>`
                        : `<td align="right" style="vertical-align:middle;"></td>`
                    }
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="card" style="background:linear-gradient(135deg, rgba(147,51,234,0.18), rgba(59,130,246,0.14));border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 20px 16px 20px;">
                ${contentHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:14px 4px 0 4px;">
                <div style="font-size:12px;color:#94a3b8;line-height:1.6;">
                  You’re receiving this email because a form was submitted on your website.
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
  const { name, email, phone, company, projectType, budget, message } = await request.json();

  // Validation
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const emailService = process.env.EMAIL_SERVICE;
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPortRaw = process.env.SMTP_PORT;
    const smtpPort = smtpPortRaw ? Number.parseInt(smtpPortRaw.trim(), 10) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM;
    const contactEmail = process.env.SMTP_TO || process.env.CONTACT_EMAIL || 'contact@elvoriatech.com';
    const companyName = process.env.COMPANY_NAME || 'Elvoriatech';
    const siteUrl = process.env.SITE_URL || 'https://elvoriatech.com';
    const supportPhone = process.env.SUPPORT_PHONE || '';
    const sendAutoReply = String(process.env.SEND_AUTOREPLY ?? 'true').toLowerCase() !== 'false';

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
    const attachmentPath = path.join(process.cwd(), 'public', 'elvoria.png');
    const attachments = fs.existsSync(attachmentPath)
      ? [
          {
            filename: 'elvoria.png',
            path: attachmentPath,
            cid: 'elvoria-mark',
          },
        ]
      : [];

    // Email to company
    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safePhone = escapeHtml(String(phone || 'Not provided'));
    const safeCompany = escapeHtml(String(company || 'Not provided'));
    const safeProjectType = escapeHtml(String(projectType || 'Not specified'));
    const safeBudget = escapeHtml(String(budget || 'Not specified'));
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br>');

    await transporter.sendMail({
      from: fromAddress,
      to: contactEmail,
      subject: `New Contact Form Submission — ${name}`,
      html: renderEmailShell({
        title: 'New Contact Form Submission',
        preheader: `New contact form submission from ${name}.`,
        showTimestamp: true,
        contentHtml: `
          <div class="h1" style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 10px 0;">New Contact Form Submission</div>
          <div class="p" style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 14px 0;">
            A new inquiry has been submitted through your website contact form.
          </div>

          <div style="font-size:12px;color:#94a3b8;margin:0 0 8px 0;">Contact Details</div>
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
              <td colspan="2" style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">Phone</div>
                <div style="font-size:14px;color:#e5e7eb;">${safePhone}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">Company</div>
                <div style="font-size:14px;color:#e5e7eb;">${safeCompany}</div>
              </td>
              <td style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:12px;color:#94a3b8;">Project type</div>
                <div style="font-size:14px;color:#e5e7eb;">${safeProjectType}</div>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px 14px;">
                <div style="font-size:12px;color:#94a3b8;">Budget</div>
                <div style="font-size:14px;color:#e5e7eb;">${safeBudget}</div>
              </td>
            </tr>
          </table>

          <div style="margin-top:14px;background:rgba(2,6,23,0.55);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Message</div>
            <div style="font-size:14px;color:#e5e7eb;line-height:1.7;">${safeMessage || '—'}</div>
          </div>

          <div class="p" style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:14px 0 0 0;">
            Please respond to this inquiry at your earliest convenience.
          </div>

          <div style="margin-top:14px;">
            <a href="mailto:${encodeURIComponent(String(email))}" style="display:inline-block;background:linear-gradient(90deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 14px;border-radius:10px;">
              Reply to ${safeName}
            </a>
          </div>

          <div style="margin-top:12px;font-size:12px;color:#94a3b8;line-height:1.6;">
            Best regards,<br>
            Your Website Notification System
          </div>
        `,
      }),
      attachments,
      replyTo: email,
    });

    // Confirmation email to user (do not fail the request if this fails)
    let autoReplySent = false;
    let autoReplyError: string | undefined;
    if (sendAutoReply) {
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: `Thank you for contacting ${companyName}`,
          replyTo: contactEmail,
          html: renderEmailShell({
            title: 'We received your message',
            preheader: 'Thanks — we’ll get back to you shortly.',
            showTimestamp: false,
            contentHtml: `
            <div class="h1" style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 10px 0;">Thank you for reaching out</div>
            <div class="p" style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 14px 0;">
              Dear ${safeName},<br><br>
              Thank you for reaching out to us. We have received your message and appreciate your interest.
            </div>

            <div class="p" style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 14px 0;">
              Our team will review your inquiry and get back to you as soon as possible, typically within <strong>24–48 hours</strong>.
            </div>

            <div class="p" style="font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 14px 0;">
              If your request is urgent, please feel free to reply to this email.
            </div>

            <div style="background:rgba(2,6,23,0.55);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;">
              <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Your message</div>
              <div style="font-size:14px;color:#e5e7eb;line-height:1.7;">${safeMessage || '—'}</div>
            </div>

            <div style="margin-top:14px;font-size:13px;color:#cbd5e1;line-height:1.7;">
              We look forward to assisting you.
            </div>

            <div style="margin-top:14px;font-size:12px;color:#94a3b8;line-height:1.7;">
              Best regards,<br>
              ${escapeHtml(companyName)}<br>
              <a href="${escapeHtml(siteUrl)}" style="color:#93c5fd;text-decoration:none;">${escapeHtml(siteUrl)}</a><br>
              <a href="mailto:${escapeHtml(contactEmail)}" style="color:#93c5fd;text-decoration:none;">${escapeHtml(contactEmail)}</a>${supportPhone ? `<br>${escapeHtml(supportPhone)}` : ''}
            </div>
          `,
          }),
          attachments,
        });
        autoReplySent = true;
      } catch (err) {
        const e = err as { code?: string; message?: string };
        autoReplyError = `${e?.code ? `${e.code}: ` : ''}${e?.message ? String(e.message) : 'unknown error'}`;
        console.error('Auto-reply email error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      autoReplyEnabled: sendAutoReply,
      autoReplySent,
      autoReplyError,
    });
  } catch (error) {
    console.error('Email error:', error);
    const pub = toPublicEmailError(error);
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }
}
