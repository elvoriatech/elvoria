'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AdminProposalQueueRow } from '@/lib/proposalFinalizeLog';

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) throw new Error('Empty response');
  return JSON.parse(text) as unknown;
}

export function AdminProposalQueue({ rows }: { rows: AdminProposalQueueRow[] }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busyVersion, setBusyVersion] = useState<string | null>(null);

  async function sendPdf(versionId: string, defaultEmail: string) {
    setError('');
    const to = window.prompt('Send PDF to email address:', defaultEmail || '');
    if (to === null) return;
    const trimmed = to.trim().toLowerCase();
    if (!trimmed) {
      setError('Email is required.');
      return;
    }
    setBusyVersion(versionId);
    try {
      const res = await fetch('/api/admin/send-proposal-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, to: trimmed }),
      });
      const data = (await readJsonBody(res)) as { error?: string };
      if (!res.ok) {
        setError(data?.error || 'Send failed');
        return;
      }
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setBusyVersion(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600 dark:border-border dark:bg-muted/20 dark:text-muted-foreground">
        No finalized proposals yet. When a visitor generates a proposal (PDF ready or not), it appears here for follow-up.
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
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-border dark:bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Finalized</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Visitor</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Email</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">PDF on server</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Last status</th>
              <th className="px-3 py-2 font-semibold text-slate-800 dark:text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.versionId} className="border-b border-slate-100 last:border-0 dark:border-border/60">
                <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-muted-foreground">{row.finalizedAt}</td>
                <td className="px-3 py-2 text-slate-900 dark:text-foreground">{row.visitorName || '—'}</td>
                <td className="px-3 py-2 text-slate-900 dark:text-foreground">{row.visitorEmail || '—'}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      row.pdfFilePresent
                        ? 'font-medium text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-muted-foreground'
                    }
                  >
                    {row.pdfFilePresent ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="max-w-[220px] px-3 py-2 text-slate-600 dark:text-muted-foreground">
                  <span className="font-medium text-slate-800 dark:text-foreground">{row.pdfStatus}</span>
                  {row.pdfError ? (
                    <span className="mt-1 block truncate text-xs text-red-600 dark:text-red-400" title={row.pdfError}>
                      {row.pdfError}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    {row.pdfFilePresent ? (
                      <a
                        href={`/api/admin/proposal-pdf/${row.versionId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-border dark:bg-transparent dark:text-foreground dark:hover:bg-muted/60"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-400 dark:border-border/50 dark:text-muted-foreground">
                        View PDF
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={!row.pdfFilePresent || busyVersion === row.versionId}
                      title={!row.pdfFilePresent ? 'PDF file is not on the server yet' : undefined}
                      onClick={() => void sendPdf(row.versionId, row.visitorEmail)}
                      className="rounded-md border border-cyan-600/40 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-900 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100 dark:hover:bg-cyan-500/20"
                    >
                      {busyVersion === row.versionId ? 'Sending…' : 'Send PDF by email'}
                    </button>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-slate-400 dark:text-muted-foreground/80" title="Version ID">
                    {row.versionId}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
