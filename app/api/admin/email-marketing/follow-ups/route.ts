import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { processAutoFollowUps } from '@/lib/emailMarketing/send';

export async function POST() {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const result = await processAutoFollowUps();
    return NextResponse.json(result);
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
