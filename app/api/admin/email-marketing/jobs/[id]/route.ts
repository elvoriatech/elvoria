import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { cancelSendJob, getSendJob } from '@/lib/emailMarketing/jobs';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const { id } = await context.params;
    const job = await getSendJob(id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ job });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const { id } = await context.params;
    const job = await cancelSendJob(id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ job });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
