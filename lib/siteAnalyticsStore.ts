import { getPool, isDbConfigured } from '@/lib/db';
import { isPostgrestMissingTableError } from '@/lib/crmSchemaError';

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly';
export type TimeSeriesPoint = { label: string; visitors: number; views: number };
export type TopPageSlice = { path: string; views: number };

export type SiteAnalyticsReport = {
  period: AnalyticsPeriod;
  totalVisitors: number;
  totalViews: number;
  series: TimeSeriesPoint[];
  topPages: TopPageSlice[];
  schemaApplied: boolean;
};

export async function isSiteAnalyticsSchemaApplied(): Promise<boolean> {
  if (!isDbConfigured()) return false;
  try {
    await getPool().query('SELECT id FROM site_page_views LIMIT 1');
    return true;
  } catch (e) {
    if (isPostgrestMissingTableError(e)) return false;
    return false;
  }
}

export async function recordPageView(visitorId: string, path: string): Promise<void> {
  if (!isDbConfigured()) return;
  const cleanPath = path.slice(0, 500) || '/';
  try {
    await getPool().query(
      'INSERT INTO site_page_views (visitor_id, path) VALUES ($1, $2)',
      [visitorId, cleanPath]
    );
  } catch (e) {
    if (!isPostgrestMissingTableError(e)) throw e;
  }
}

function periodStart(period: AnalyticsPeriod): Date {
  const now = new Date();
  if (period === 'daily') {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - 29);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'weekly') {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - 7 * 11);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
}

function bucketKey(iso: string, period: AnalyticsPeriod): string {
  const d = new Date(iso);
  if (period === 'daily') return d.toISOString().slice(0, 10);
  if (period === 'weekly') {
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
    return monday.toISOString().slice(0, 10);
  }
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatLabel(key: string, period: AnalyticsPeriod): string {
  if (period === 'monthly') {
    const [y, m] = key.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[Number(m) - 1]} ${y?.slice(2)}`;
  }
  const d = new Date(`${key}T12:00:00Z`);
  if (period === 'weekly') {
    return `W/C ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`;
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function emptyBuckets(period: AnalyticsPeriod): string[] {
  const keys: string[] = [];
  const start = periodStart(period);
  const now = new Date();
  if (period === 'daily') {
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      if (d > now) break;
      keys.push(d.toISOString().slice(0, 10));
    }
    return keys;
  }
  if (period === 'weekly') {
    const cursor = new Date(start);
    while (cursor <= now) {
      keys.push(bucketKey(cursor.toISOString(), 'weekly'));
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }
    return [...new Set(keys)];
  }
  const cursor = new Date(start);
  while (cursor <= now) {
    keys.push(bucketKey(cursor.toISOString(), 'monthly'));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return keys;
}

export async function getSiteAnalyticsReport(period: AnalyticsPeriod): Promise<SiteAnalyticsReport> {
  const empty: SiteAnalyticsReport = {
    period,
    totalVisitors: 0,
    totalViews: 0,
    series: emptyBuckets(period).map((label) => ({ label: formatLabel(label, period), visitors: 0, views: 0 })),
    topPages: [],
    schemaApplied: false,
  };

  if (!isDbConfigured()) return empty;

  const schemaApplied = await isSiteAnalyticsSchemaApplied();
  if (!schemaApplied) return empty;

  const since = periodStart(period).toISOString();
  const { rows } = await getPool().query<{ visitor_id: string; path: string; viewed_at: string }>(
    'SELECT visitor_id, path, viewed_at FROM site_page_views WHERE viewed_at >= $1 ORDER BY viewed_at ASC LIMIT 50000',
    [since]
  );

  const viewsByBucket = new Map<string, number>();
  const visitorsByBucket = new Map<string, Set<string>>();
  const viewsByPath = new Map<string, number>();
  const allVisitors = new Set<string>();

  for (const row of rows) {
    const key = bucketKey(row.viewed_at, period);
    viewsByBucket.set(key, (viewsByBucket.get(key) || 0) + 1);
    if (!visitorsByBucket.has(key)) visitorsByBucket.set(key, new Set());
    visitorsByBucket.get(key)!.add(row.visitor_id);
    allVisitors.add(row.visitor_id);
    const p = row.path || '/';
    viewsByPath.set(p, (viewsByPath.get(p) || 0) + 1);
  }

  const series = emptyBuckets(period).map((key) => ({
    label: formatLabel(key, period),
    visitors: visitorsByBucket.get(key)?.size ?? 0,
    views: viewsByBucket.get(key) ?? 0,
  }));

  const topPages = [...viewsByPath.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, views]) => ({ path, views }));

  return {
    period,
    totalVisitors: allVisitors.size,
    totalViews: rows.length,
    series,
    topPages,
    schemaApplied: true,
  };
}
