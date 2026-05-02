'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600 dark:border-border dark:bg-muted/20 dark:text-muted-foreground">
        No leads yet. Submissions appear here when visitors complete the proposal assistant gate form.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card dark:shadow-none">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-border dark:bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">#</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Timestamp</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Name</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Email</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Company</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Phone</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Source</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((row, index) => (
              <tr
                key={`${row.timestamp}-${index}`}
                className="border-b border-slate-100 last:border-0 dark:border-border/60"
              >
                <td className="px-3 py-2 text-slate-500 dark:text-muted-foreground">{index + 1}</td>
                <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-muted-foreground">{row.timestamp}</td>
                <td className="px-3 py-2 text-slate-900 dark:text-foreground">{row.fullName}</td>
                <td className="px-3 py-2 text-slate-900 dark:text-foreground">{row.email}</td>
                <td className="px-3 py-2 text-slate-900 dark:text-foreground">{row.company}</td>
                <td className="px-3 py-2 text-slate-600 dark:text-muted-foreground">{row.phone || '—'}</td>
                <td className="px-3 py-2 text-slate-600 dark:text-muted-foreground">{row.source}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => void removeAt(index)}
                    disabled={deleting === index}
                    className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
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
