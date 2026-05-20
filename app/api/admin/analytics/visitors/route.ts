import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import {
  getSiteAnalyticsReport,
  type AnalyticsPeriod,
} from '@/lib/siteAnalyticsStore';

const PERIODS = new Set<AnalyticsPeriod>(['daily', 'weekly', 'monthly']);

export async function GET(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const period = (request.nextUrl.searchParams.get('period') || 'daily') as AnalyticsPeriod;
  if (!PERIODS.has(period)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
  }

  const report = await getSiteAnalyticsReport(period);
  return NextResponse.json({ report });
}
