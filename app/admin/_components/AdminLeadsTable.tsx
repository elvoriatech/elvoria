'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatAdminTimestamp } from '@/lib/formatAdminTimestamp';
import type { SupportLeadRecord } from '@/lib/supportLeads';

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) throw new Error('Empty response');
  return JSON.parse(text) as unknown;
}

export function AdminLeadsTable({ leads }: { leads: SupportLeadRecord[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function removeAt(index: number) {
    if (!window.confirm('Delete this record permanently?')) return;
    setError('');
    setDeleting(index);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });
      const data = (await readJsonBody(res)) as { error?: string };
      if (!res.ok) {
        setError(data?.error || 'Delete failed');
        return;
      }
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setDeleting(null);
    }
  }

  if (leads.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-base leading-relaxed text-muted-foreground">
        No leads yet. Submissions appear here when visitors complete the proposal assistant gate form.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-md ring-1 ring-border/60 dark:bg-slate-950 dark:ring-white/10">
        <table className="w-full min-w-[760px] text-left text-[15px] leading-snug">
          <thead className="border-b-2 border-border bg-muted/50 dark:bg-slate-800/90">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timestamp</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((row, index) => (
              <tr
                key={`${row.timestamp}-${index}`}
                className="border-b border-border odd:bg-card even:bg-muted/30 last:border-0 dark:even:bg-slate-800/35"
              >
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground/90">{formatAdminTimestamp(row.timestamp)}</td>
                <td className="px-4 py-3 font-medium text-foreground">{row.fullName}</td>
                <td className="px-4 py-3 text-foreground/95">{row.email}</td>
                <td className="px-4 py-3 text-foreground/95">{row.company || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground/90">{row.phone || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.source}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void removeAt(index)}
                    disabled={deleting === index}
                    className="rounded-md border border-destructive/40 bg-background px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {deleting === index ? '…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
