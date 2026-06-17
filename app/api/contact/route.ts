import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { escapeHtmlEmail as escapeHtml, renderElvoriaEmailShell } from '@/lib/emailShell';
import { getContactEmail, isSiteMailConfigured, sendSiteHtmlEmail } from '@/lib/siteMailer';
import { isVisitorAutoReplyEnabled, sendContactFormAutoReply } from '@/lib/visitorAckEmail';

function toPublicEmailError(error: unknown) {
  const e = error as { code?: string; responseCode?: number; message?: string };
  if (e?.code === 'EAUTH' || e?.responseCode === 535) {
    return {
      status: 500,
      message:
        'Email login failed (Gmail). Use a Google App Password in EMAIL_PASSWORD and EMAIL_USER as the mailbox address.',
    };
  }
  const code = e?.code ? ` (${e.code})` : '';
  const msg = e?.message ? `: ${String(e.message)}` : '';
  return { status: 500, message: `Failed to send email${code}${msg}` };
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
    if (!isSiteMailConfigured()) {
      return NextResponse.json(
        {
          error:
            'Email is not configured. Set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD in .env.local',
        },
        { status: 500 }
      );
    }

    const contactEmail = getContactEmail();
    const companyName = process.env.COMPANY_NAME || 'Elvoria Technologies';
    const sendAutoReply = isVisitorAutoReplyEnabled();

    const attachmentPath = path.join(process.cwd(), 'public', 'elvoria.png');
    const attachments = fs.existsSync(attachmentPath)
      ? [{ filename: 'elvoria.png', path: attachmentPath, cid: 'elvoria-mark' }]
      : [];

    // Email to company
    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safePhone = escapeHtml(String(phone || 'Not provided'));
    const safeCompany = escapeHtml(String(company || 'Not provided'));
    const safeProjectType = escapeHtml(String(projectType || 'Not specified'));
    const safeBudget = escapeHtml(String(budget || 'Not specified'));
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br>');

    const staffMail = await sendSiteHtmlEmail({
      to: contactEmail,
      replyTo: email,
      subject: `New Contact Form Submission — ${name}`,
      html: renderElvoriaEmailShell({
        title: 'New Contact Form Submission',
        preheader: `New contact form submission from ${name}.`,
        showTimestamp: true,
        logoImgSrc: 'cid:elvoria-mark',
        footerNoteHtml:
          'You’re receiving this email because a message was submitted via your website contact form.',
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
            <a href="mailto:${encodeURIComponent(String(email))}" style="display:inline-block;background:linear-gradient(90deg,#06b6d4,#3b82f6);color:#04131a;text-decoration:none;font-weight:800;font-size:13px;padding:11px 14px;border-radius:12px;">
              Reply to ${safeName}
            </a>
          </div>

          <div style="margin-top:12px;font-size:12px;color:#94a3b8;line-height:1.6;">
            Best regards,<br>
            ${escapeHtml(companyName)} Team
          </div>
        `,
      }),
      attachments,
    });
    if (!staffMail.sent) {
      const err = toPublicEmailError(new Error(staffMail.detail || 'Send failed'));
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    // Confirmation email to visitor (do not fail the request if this fails)
    let autoReplySent = false;
    let autoReplyError: string | undefined;
    if (sendAutoReply) {
      try {
        const auto = await sendContactFormAutoReply({ name, email, message });
        autoReplySent = auto.sent;
        if (!auto.sent && !auto.skipped) autoReplyError = auto.detail;
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
