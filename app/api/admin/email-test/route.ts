import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { verifySiteMailer } from '@/lib/siteMailer';

/** POST — verify Gmail/SMTP credentials (no email sent). */
export async function POST() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const result = await verifySiteMailer();
  if (result.ok) {
    return NextResponse.json({
      ok: true,
      message: `Email login OK (${result.service}). From: ${result.from}`,
      service: result.service,
      from: result.from,
    });
  }
  return NextResponse.json(
    { ok: false, reason: result.reason, error: result.detail },
    { status: result.reason === 'not_configured' ? 503 : 500 }
  );
}
