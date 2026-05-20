'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FollowUpStatus } from '@/lib/crmStore';

const STATUS_OPTIONS: { value: FollowUpStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export function AdminConversationFollowUp({
  conversationId,
  initialStatus,
  initialNotes,
  initialNextAt,
}: {
  conversationId: string;
  initialStatus: FollowUpStatus;
  initialNotes: string;
  initialNextAt: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [nextAt, setNextAt] = useState(
    initialNextAt ? new Date(initialNextAt).toISOString().slice(0, 16) : ''
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function save() {
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/follow-up`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followUpStatus: status,
          followUpNotes: notes,
          followUpNextAt: nextAt ? new Date(nextAt).toISOString() : null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Save failed');
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-border/60">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Follow-up</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-foreground">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FollowUpStatus)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Next follow-up</span>
          <input
            type="datetime-local"
            value={nextAt}
            onChange={(e) => setNextAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm">
        <span className="font-medium text-foreground">Internal notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
          placeholder="Call notes, next steps, objections…"
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-lg bg-[#0e7490] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0891b2] disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-500"
        >
          {busy ? 'Saving…' : 'Save follow-up'}
        </button>
        {saved ? <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span> : null}
        {error ? <span className="text-sm text-destructive">{error}</span> : null}
      </div>
    </div>
  );
}
