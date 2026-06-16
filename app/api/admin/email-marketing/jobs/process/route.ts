import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { processSendJobBatch } from '@/lib/emailMarketing/jobs';

export const maxDuration = 60;

/** Processes one batch; called by the Campaigns UI while a send job is active. */
export async function POST() {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const result = await processSendJobBatch();
    return NextResponse.json(result);
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
