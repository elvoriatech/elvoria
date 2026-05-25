'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { EmailRecipient } from '@/lib/emailMarketing/types';
import {
  loadStoredRecipientSelection,
  saveStoredRecipientSelection,
} from '@/lib/emailMarketing/recipientSelectionStorage';
import { AdminConfirmModal } from './AdminConfirmModal';
import { RecipientPaginationControls } from './RecipientPaginationControls';
import { RecipientSelectionToolbar } from './RecipientSelectionToolbar';
import { fetchRecipientIdsByStatus, usePaginatedRecipients } from './usePaginatedRecipients';

export function EmailRecipientsManager() {
  const { page, setPage, rows, total, totalPages, loading, error, loadPage, refresh, rangeStart, rangeEnd } =
    usePaginatedRecipients();
  const [selected, setSelected] = useState<Set<string>>(() => loadStoredRecipientSelection());
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    industry: '',
    notes: '',
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [selectBusy, setSelectBusy] = useState(false);

  useEffect(() => {
    saveStoredRecipientSelection(selected);
  }, [selected]);

  const pageSelectedCount = useMemo(
    () => rows.filter((r) => selected.has(r.id)).length,
    [rows, selected]
  );

  const statusLabel = useMemo(
    () =>
      ({
        not_sent: 'Not sent',
        sent: 'Sent',
        replied: 'Replied',
      }) as const,
    []
  );

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function togglePage() {
    const pageIds = rows.map((r) => r.id);
    const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
    setSelected((s) => {
      const n = new Set(s);
      if (allOnPage) {
        for (const id of pageIds) n.delete(id);
      } else {
        for (const id of pageIds) n.add(id);
      }
      return n;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function selectAllNotSent() {
    setSelectBusy(true);
    try {
      const ids = await fetchRecipientIdsByStatus('not_sent');
      setSelected(new Set(ids));
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSelectBusy(false);
    }
  }

  async function addManual() {
    setFormError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/email-marketing/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed');
      setForm({ companyName: '', contactName: '', email: '', industry: '', notes: '' });
      await refresh();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadExcel(file: File) {
    setUploadMsg('');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/email-marketing/recipients/upload', { method: 'POST', body: fd });
      const data = (await res.json()) as { error?: string; inserted?: number; skipped?: number };
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadMsg(`Imported ${data.inserted ?? 0}, skipped ${data.skipped ?? 0}`);
      await loadPage(1);
    } catch (e) {
      setUploadMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeConfirmed(id: string) {
    setDeleteTargetId(null);
    setBusy(true);
    try {
      await fetch('/api/admin/email-marketing/recipients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function markReplied(id: string) {
    setBusy(true);
    try {
      await fetch('/api/admin/email-marketing/recipients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, markReplied: true }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Add company manually</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Company name"
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Contact person"
            value={form.contactName}
            onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Industry"
            value={form.industry}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        {formError ? <p className="mt-2 text-sm text-destructive">{formError}</p> : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void addManual()}
          className="mt-4 rounded-lg bg-[#0e7490] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-cyan-600"
        >
          Add recipient
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Upload Excel (.xlsx)</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Required columns (row 1 = headers): <strong className="text-foreground">First Name</strong>,{' '}
          <strong className="text-foreground">Email</strong>, <strong className="text-foreground">Company Name</strong>,{' '}
          <strong className="text-foreground">Industry</strong>.
        </p>
        <a
          href="/email-recipients-sample.xlsx"
          download="email-recipients-sample.xlsx"
          className="mt-2 inline-block text-sm font-semibold text-[#0e7490] underline decoration-[#06B6D4]/50 hover:text-[#0891b2] dark:text-cyan-300"
        >
          Download sample template (.xlsx)
        </a>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="mt-3 block text-sm"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadExcel(f);
            e.target.value = '';
          }}
        />
        {uploadMsg ? <p className="mt-2 text-sm text-muted-foreground">{uploadMsg}</p> : null}
      </div>

      <div className="space-y-3">
        <RecipientPaginationControls
          page={page}
          totalPages={totalPages}
          total={total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          loading={loading}
          onPageChange={setPage}
        />
        <RecipientSelectionToolbar
          selectedCount={selected.size}
          pageSelectedCount={pageSelectedCount}
          pageRowCount={rows.length}
          busy={busy || selectBusy || loading}
          onSelectPage={togglePage}
          onClear={clearSelection}
          onSelectNotSent={() => void selectAllNotSent()}
        />
        {selected.size > 0 ? (
          <p className="text-sm">
            <Link
              href="/admin/email-marketing/campaigns"
              className="font-semibold text-[#0e7490] underline dark:text-cyan-300"
            >
              Send campaign with {selected.size.toLocaleString()} selected →
            </Link>
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {loading && rows.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-muted-foreground">No recipients yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[900px] text-left text-[15px]">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Select</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Email</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Company</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Industry</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: EmailRecipient) => (
                  <tr key={r.id} className="border-b last:border-0 odd:bg-card even:bg-muted/20">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                        aria-label={`Select ${r.email}`}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{r.contactName || '—'}</td>
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">{r.companyName || '—'}</td>
                    <td className="px-3 py-2">{r.industry || '—'}</td>
                    <td className="px-3 py-2 capitalize">{statusLabel[r.status]}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.status !== 'replied' ? (
                        <button
                          type="button"
                          className="mr-2 text-xs font-semibold text-[#0e7490] underline dark:text-cyan-300"
                          onClick={() => void markReplied(r.id)}
                        >
                          Mark replied
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-xs font-semibold text-destructive"
                        onClick={() => setDeleteTargetId(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminConfirmModal
        open={deleteTargetId !== null}
        title="Delete recipient?"
        description="This company will be removed from your list permanently."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => deleteTargetId && void removeConfirmed(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
