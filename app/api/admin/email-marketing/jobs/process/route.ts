import { NextRequest, NextResponse } from 'next/server';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { requireJobProcessorAuth } from '@/lib/emailMarketing/jobAuth';
import { processSendJobBatch } from '@/lib/emailMarketing/jobs';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const denied = await requireJobProcessorAuth(request);
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

/** Vercel Cron uses GET */
export async function GET(request: NextRequest) {
  return POST(request);
}
