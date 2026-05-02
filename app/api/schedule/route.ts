import { NextRequest, NextResponse } from 'next/server';
import { sendConsultationEmails } from '@/lib/consultationEmail';

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
  return { status: 500, message: `Failed to send scheduling request${code}${msg}` };
}

export async function POST(request: NextRequest) {
  const { name, email, company, preferredDate, preferredTime, timeZone, notes } = await request.json();

  if (!name || !email || !preferredDate || !preferredTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const when = `${preferredDate} at ${preferredTime} (${timeZone || 'local time'})`;

    await sendConsultationEmails({
      name: String(name),
      email: String(email),
      company: company ? String(company) : undefined,
      whenDisplay: when,
      notes: notes ? String(notes) : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Schedule email error:', error);
    const pub = toPublicEmailError(error);
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }
}
