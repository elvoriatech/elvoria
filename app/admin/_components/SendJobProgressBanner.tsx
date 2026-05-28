'use client';

import type { EmailSendJob } from '@/lib/emailMarketing/types';
import { TEMPLATE_LABELS } from '@/lib/emailMarketing/types';

type Props = {
  job: EmailSendJob;
  progressPercent: number;
  busy?: boolean;
  onCancel: () => void;
};

export function SendJobProgressBanner({ job, progressPercent, busy, onCancel }: Props) {
  const isActive = job.status === 'queued' || job.status === 'running';

  return (
    <div
      className={
        isActive
          ? 'rounded-xl border border-amber-500/40 bg-amber-500/10 p-4'
          : 'rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {isActive ? 'Sending in background…' : `Campaign ${job.status}`}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {TEMPLATE_LABELS[job.templateType]} — {job.processedIndex.toLocaleString()} /{' '}
            {job.totalCount.toLocaleString()} processed · {job.sentCount.toLocaleString()} sent ·{' '}
            {job.failedCount.toLocaleString()} failed
          </p>
        </div>
        {isActive ? (
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            Cancel job
          </button>
        ) : null}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-[#0e7490] transition-all duration-300 dark:bg-cyan-600"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {job.lastError && isActive ? (
        <p className="mt-2 text-xs text-muted-foreground">Latest: {job.lastError}</p>
      ) : null}
    </div>
  );
}
