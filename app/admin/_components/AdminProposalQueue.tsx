'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { formatAdminTimestamp } from '@/lib/formatAdminTimestamp';
import type { AdminProposalQueueRow } from '@/lib/proposalFinalizeLog';

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) throw new Error('Empty response');
  return JSON.parse(text) as unknown;
}

function sortProposalRows(rows: AdminProposalQueueRow[]): AdminProposalQueueRow[] {
  return [...rows].sort((a, b) => {
    const aNeed = a.pdfFilePresent && !a.pdfEmailedByAdminAt;
    const bNeed = b.pdfFilePresent && !b.pdfEmailedByAdminAt;
    if (aNeed !== bNeed) return aNeed ? -1 : 1;
    return new Date(b.finalizedAt).getTime() - new Date(a.finalizedAt).getTime();
  });
}

export function AdminProposalQueue({ rows }: { rows: AdminProposalQueueRow[] }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busyVersion, setBusyVersion] = useState<string | null>(null);
  const sortedRows = useMemo(() => sortProposalRows(rows), [rows]);

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
      <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-base leading-relaxed text-muted-foreground">
        No finalized proposals yet. When a visitor completes the AI proposal assistant, a row appears here. PDFs are not
        emailed to visitors automatically when generation succeeds — you send them from this list when ready.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-50">
        <strong className="font-semibold">Manual PDF delivery:</strong> successful PDF generation only enables download in
        the widget and <strong className="font-semibold">View PDF</strong> here. Use <strong className="font-semibold">Send PDF by email</strong> so the visitor receives the attachment, unless you handle delivery elsewhere.
      </div>
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-md ring-1 ring-border/60 dark:bg-slate-950 dark:ring-white/10">
        <table className="w-full min-w-[1120px] text-left text-[15px] leading-snug">
          <thead className="border-b-2 border-border bg-muted/50 dark:bg-slate-800/90">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finalized</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visitor</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">PDF on server</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visitor FYI email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">PDF emailed (admin)</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const needsSend = row.pdfFilePresent && !row.pdfEmailedByAdminAt;
              return (
              <tr
                key={row.versionId}
                className={
                  needsSend
                    ? 'border-b border-amber-500/25 bg-amber-500/[0.07] last:border-0 dark:bg-amber-500/10'
                    : 'border-b border-border odd:bg-card even:bg-muted/30 last:border-0 dark:even:bg-slate-800/35'
                }
              >
                <td className="px-4 py-3 whitespace-nowrap text-foreground/90">
                  {formatAdminTimestamp(row.finalizedAt)}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{row.visitorName || '—'}</td>
                <td className="px-4 py-3 text-foreground/95">{row.visitorEmail || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      row.pdfFilePresent
                        ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                        : 'font-medium text-muted-foreground'
                    }
                  >
                    {row.pdfFilePresent ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="max-w-[140px] px-4 py-3 text-sm text-muted-foreground">
                  {row.pdfStatus !== 'ready' ? (
                    row.visitorNotifiedPdfIssue ? (
                      <span className="font-medium text-emerald-800 dark:text-emerald-300">Sent (PDF issue)</span>
                    ) : (
                      <span className="text-muted-foreground">Not sent / N/A</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                  {row.pdfEmailedByAdminAt ? (
                    <span className="font-medium text-foreground/90">{formatAdminTimestamp(row.pdfEmailedByAdminAt)}</span>
                  ) : row.pdfFilePresent ? (
                    <span className="font-semibold text-amber-900 dark:text-amber-200" title="Updates when you use Send PDF by email from this admin">
                      Not sent (or not recorded)
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td className="max-w-[260px] px-4 py-3 text-muted-foreground">
                  <span className="font-medium text-foreground">{row.pdfStatus}</span>
                  {row.pdfError ? (
                    <span className="mt-1 block text-sm leading-snug text-destructive" title={row.pdfError}>
                      {row.pdfError}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap align-top">
                  <div className="flex flex-wrap gap-2">
                    {row.pdfFilePresent ? (
                      <a
                        href={`/api/admin/proposal-pdf/${row.versionId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        View PDF
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={!row.pdfFilePresent || busyVersion === row.versionId}
                      title={!row.pdfFilePresent ? 'PDF file is not on the server yet' : undefined}
                      onClick={() => void sendPdf(row.versionId, row.visitorEmail)}
                      className="rounded-md border border-[#06B6D4]/50 bg-[#06B6D4]/10 px-3 py-1.5 text-xs font-semibold text-[#0e7490] hover:bg-[#06B6D4]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-500/25"
                    >
                      {busyVersion === row.versionId ? 'Sending…' : 'Send PDF by email'}
                    </button>
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] leading-tight text-muted-foreground" title="Version ID">
                    {row.versionId}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
