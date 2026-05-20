'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, LineChart, PieChart } from 'lucide-react';
import type { AnalyticsPeriod, SiteAnalyticsReport } from '@/lib/siteAnalyticsStore';

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  daily: 'Daily (30 days)',
  weekly: 'Weekly (12 weeks)',
  monthly: 'Monthly (12 months)',
};

function maxOf(series: SiteAnalyticsReport['series'], key: 'visitors' | 'views') {
  return Math.max(1, ...series.map((p) => p[key]));
}

function LineVisitorsChart({ report }: { report: SiteAnalyticsReport }) {
  const w = 560;
  const h = 200;
  const pad = { t: 16, r: 16, b: 36, l: 40 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = maxOf(report.series, 'visitors');
  const points = report.series.map((p, i) => {
    const x = pad.l + (i / Math.max(1, report.series.length - 1)) * innerW;
    const y = pad.t + innerH - (p.visitors / max) * innerH;
    return `${x},${y}`;
  });
  const polyline = points.join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Visitors line chart">
      <line x1={pad.l} y1={pad.t + innerH} x2={w - pad.r} y2={pad.t + innerH} stroke="currentColor" strokeOpacity="0.15" />
      <polyline fill="none" stroke="#06b6d4" strokeWidth="2.5" points={polyline} />
      {report.series.map((p, i) => {
        const x = pad.l + (i / Math.max(1, report.series.length - 1)) * innerW;
        const y = pad.t + innerH - (p.visitors / max) * innerH;
        return <circle key={p.label} cx={x} cy={y} r="3.5" fill="#0891b2" />;
      })}
    </svg>
  );
}

function BarViewsChart({ report }: { report: SiteAnalyticsReport }) {
  const max = maxOf(report.series, 'views');
  return (
    <div className="flex h-48 items-end gap-1 sm:gap-1.5" role="img" aria-label="Page views bar chart">
      {report.series.map((p) => (
        <div key={p.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-gradient-to-t from-[#6366f1] to-[#06b6d4] transition-all"
            style={{ height: `${Math.max(4, (p.views / max) * 100)}%` }}
            title={`${p.label}: ${p.views} views`}
          />
          <span className="hidden max-w-full truncate text-[9px] text-muted-foreground sm:block">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

function PieTopPagesChart({ report }: { report: SiteAnalyticsReport }) {
  const total = report.topPages.reduce((s, p) => s + p.views, 0) || 1;
  const colors = ['#06b6d4', '#6366f1', '#0891b2', '#818cf8', '#22d3ee', '#a5b4fc', '#67e8f9', '#c7d2fe'];
  let angle = 0;
  const r = 72;
  const cx = 90;
  const cy = 90;

  const slices = report.topPages.map((page, i) => {
    const portion = page.views / total;
    const start = angle;
    angle += portion * 360;
    const end = angle;
    const large = end - start > 180 ? 1 : 0;
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(start - 90));
    const y1 = cy + r * Math.sin(rad(start - 90));
    const x2 = cx + r * Math.cos(rad(end - 90));
    const y2 = cy + r * Math.sin(rad(end - 90));
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { page, d, color: colors[i % colors.length] };
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <svg viewBox="0 0 180 180" className="mx-auto h-44 w-44 shrink-0" role="img" aria-label="Top pages pie chart">
        {slices.map(({ page, d, color }) => (
          <path key={page.path} d={d} fill={color} stroke="#fff" strokeWidth="1" />
        ))}
      </svg>
      <ul className="min-w-0 flex-1 space-y-2 text-sm">
        {report.topPages.map((p, i) => (
          <li key={p.path} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-foreground">{p.path}</span>
            <span className="shrink-0 font-medium text-muted-foreground">{p.views}</span>
          </li>
        ))}
        {!report.topPages.length ? (
          <li className="text-muted-foreground">No page data yet.</li>
        ) : null}
      </ul>
    </div>
  );
}

export function AdminSiteAnalytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('daily');
  const [report, setReport] = useState<SiteAnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (p: AnalyticsPeriod) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/analytics/visitors?period=${p}`);
      const data = (await res.json()) as { error?: string; report?: SiteAnalyticsReport };
      if (!res.ok) throw new Error(data.error || 'Failed to load analytics');
      setReport(data.report ?? null);
    } catch (e) {
      setError((e as Error).message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(period);
  }, [period, load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(PERIOD_LABELS) as AnalyticsPeriod[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={
              period === p
                ? 'rounded-lg bg-[#0e7490] px-4 py-2 text-sm font-semibold text-white dark:bg-cyan-600'
                : 'rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground'
            }
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {!report?.schemaApplied && !loading ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
          Run <code className="rounded bg-muted px-1">supabase/site_analytics_schema.sql</code> in Supabase SQL
          Editor to start tracking visitors. Until then, charts stay empty.
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      ) : report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unique visitors</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{report.totalVisitors}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page views</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{report.totalViews}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <LineChart className="h-4 w-4 text-[#0e7490] dark:text-cyan-400" aria-hidden />
                Visitors (line)
              </div>
              <LineVisitorsChart report={report} />
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <BarChart3 className="h-4 w-4 text-[#0e7490] dark:text-cyan-400" aria-hidden />
                Page views (bar)
              </div>
              <BarViewsChart report={report} />
            </section>
          </div>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <PieChart className="h-4 w-4 text-[#0e7490] dark:text-cyan-400" aria-hidden />
              Top pages (pie)
            </div>
            <PieTopPagesChart report={report} />
          </section>
        </>
      ) : null}
    </div>
  );
}
