'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { notifyRecipientsChanged } from '@/lib/emailMarketing/recipientListEvents';
import { AdminConfirmModal } from './AdminConfirmModal';
import { RecipientDataTable } from './RecipientDataTable';
import { RecipientPaginationControls } from './RecipientPaginationControls';
import { RecipientSelectionToolbar } from './RecipientSelectionToolbar';
import { fetchRecipientIdsByStatus, usePaginatedRecipients, type StatusFilter } from './usePaginatedRecipients';
import { useRecipientSelection } from './useRecipientSelection';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not_sent', label: 'Not sent' },
  { value: 'sent', label: 'Sent' },
  { value: 'replied', label: 'Replied' },
];

export function EmailRecipientsManager() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { page, setPage, rows, total, totalPages, loading, error, loadPage, refresh, rangeStart, rangeEnd } =
    usePaginatedRecipients(statusFilter);
  const { selected, setSelected, clearSelection } = useRecipientSelection('companies');
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

  const pageSelectedCount = useMemo(
    () => rows.filter((r) => selected.has(r.id)).length,
    [rows, selected]
  );

  const pageAllSelected = rows.length > 0 && pageSelectedCount === rows.length;
  const pageSomeSelected = pageSelectedCount > 0 && !pageAllSelected;

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

  async function selectAllSent() {
    setSelectBusy(true);
    try {
      const ids = await fetchRecipientIdsByStatus('sent');
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
      notifyRecipientsChanged();
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
      notifyRecipientsChanged();
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
      notifyRecipientsChanged();
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
      notifyRecipientsChanged();
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
          Row 1 = headers. Required: <strong className="text-foreground">Business Name</strong> and{' '}
          <strong className="text-foreground">Email</strong>. Optional:{' '}
          <strong className="text-foreground">Type / Branche</strong>,{' '}
          <strong className="text-foreground">City</strong>, <strong className="text-foreground">Country</strong>.
          Header names are flexible (e.g. &ldquo;Company Name&rdquo; / &ldquo;Industry&rdquo; also work).
        </p>
        <a
          href="/api/admin/email-marketing/recipients/sample"
          download="elvoria-recipients-sample.xlsx"
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
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            Show
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <span className="text-sm text-muted-foreground">
            {total.toLocaleString()} in this view · Status = Sent only after successful SMTP
          </span>
        </div>
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
          hint="Selection clears on refresh. Use the link below to carry it to Send campaign."
          onSelectPage={togglePage}
          onClear={clearSelection}
          onSelectNotSent={() => void selectAllNotSent()}
          onSelectSent={() => void selectAllSent()}
        />
        {selected.size > 0 ? (
          <p className="text-sm">
            <Link
              href="/admin/email-marketing/campaigns?importSelection=1"
              className="inline-flex items-center rounded-lg bg-[#0e7490]/10 px-3 py-2 font-semibold text-[#0e7490] hover:bg-[#0e7490]/20 dark:bg-cyan-500/15 dark:text-cyan-300"
            >
              Continue to Send campaign with {selected.size.toLocaleString()} selected →
            </Link>
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <RecipientDataTable
          rows={rows}
          selected={selected}
          loading={loading}
          emptyMessage="No recipients yet. Add manually or upload Excel above."
          pageAllSelected={pageAllSelected}
          pageSomeSelected={pageSomeSelected}
          onToggle={toggle}
          onTogglePage={togglePage}
          showActions
          onMarkReplied={(id) => void markReplied(id)}
          onDelete={(id) => setDeleteTargetId(id)}
        />
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
