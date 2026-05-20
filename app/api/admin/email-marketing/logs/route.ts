import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { listCampaigns, listSendLogs } from '@/lib/emailMarketing/store';

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const [logs, campaigns] = await Promise.all([listSendLogs(150), listCampaigns(30)]);
    return NextResponse.json({ logs, campaigns });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
