'use client';

import { useEffect, useRef } from 'react';
import type { EmailRecipient, RecipientStatus } from '@/lib/emailMarketing/types';

const STATUS_STYLES: Record<RecipientStatus, string> = {
  not_sent:
    'bg-amber-500/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200',
  sent: 'bg-emerald-500/15 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200',
  replied: 'bg-sky-500/15 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200',
};

const STATUS_LABELS: Record<RecipientStatus, string> = {
  not_sent: 'Not sent',
  sent: 'Sent',
  replied: 'Replied',
};

type Props = {
  rows: EmailRecipient[];
  selected: Set<string>;
  loading?: boolean;
  emptyMessage?: string;
  pageAllSelected: boolean;
  pageSomeSelected: boolean;
  onToggle: (id: string) => void;
  onTogglePage: () => void;
  /** Companies tab: mark replied / delete */
  showActions?: boolean;
  onMarkReplied?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function RecipientDataTable({
  rows,
  selected,
  loading,
  emptyMessage = 'No recipients.',
  pageAllSelected,
  pageSomeSelected,
  onToggle,
  onTogglePage,
  showActions,
  onMarkReplied,
  onDelete,
}: Props) {
  const headerCheckRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = headerCheckRef.current;
    if (!el) return;
    el.indeterminate = pageSomeSelected;
  }, [pageSomeSelected]);

  if (loading && rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
        Loading recipients…
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="max-h-[min(28rem,60vh)] overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-muted/95 backdrop-blur-sm">
            <tr>
              <th className="w-12 px-3 py-3">
                <input
                  ref={headerCheckRef}
                  type="checkbox"
                  checked={pageAllSelected}
                  onChange={onTogglePage}
                  aria-label={pageAllSelected ? 'Deselect all on this page' : 'Select all on this page'}
                  className="size-4 rounded border-border"
                />
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contact
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Company
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Industry
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              {showActions ? (
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isSelected = selected.has(r.id);
              return (
                <tr
                  key={r.id}
                  className={
                    isSelected
                      ? 'border-b border-border bg-cyan-500/10 last:border-0'
                      : 'border-b border-border last:border-0 odd:bg-card even:bg-muted/15'
                  }
                >
                  <td className="px-3 py-2.5 align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(r.id)}
                      aria-label={`Select ${r.companyName || r.email}`}
                      className="size-4 rounded border-border"
                    />
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2.5 font-medium text-foreground">
                    {r.contactName || '—'}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2.5 text-foreground">{r.email}</td>
                  <td className="max-w-[160px] truncate px-3 py-2.5">{r.companyName || '—'}</td>
                  <td className="max-w-[120px] truncate px-3 py-2.5 text-muted-foreground">
                    {r.industry || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  {showActions ? (
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {r.status !== 'replied' && onMarkReplied ? (
                        <button
                          type="button"
                          className="mr-3 text-xs font-semibold text-[#0e7490] hover:underline dark:text-cyan-300"
                          onClick={() => onMarkReplied(r.id)}
                        >
                          Mark replied
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          type="button"
                          className="text-xs font-semibold text-destructive hover:underline"
                          onClick={() => onDelete(r.id)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
