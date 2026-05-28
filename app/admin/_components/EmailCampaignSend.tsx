'use client';

import { useEffect, useMemo, useState } from 'react';
import { applyTemplateVars, recipientToVars } from '@/lib/emailMarketing/templateVars';
import { notifyRecipientsChanged } from '@/lib/emailMarketing/recipientListEvents';
import {
  clearStoredRecipientSelection,
  loadStoredRecipientSelection,
  saveStoredRecipientSelection,
} from '@/lib/emailMarketing/recipientSelectionStorage';
import type { EmailTemplate, EmailTemplateType, RecipientStatus } from '@/lib/emailMarketing/types';
import { TEMPLATE_LABELS } from '@/lib/emailMarketing/types';
import { AdminConfirmModal } from './AdminConfirmModal';
import { EmailHtmlPreview } from './EmailHtmlPreview';
import { RecipientPaginationControls } from './RecipientPaginationControls';
import { RecipientSelectionToolbar } from './RecipientSelectionToolbar';
import { SendJobProgressBanner } from './SendJobProgressBanner';
import { fetchRecipientIdsByStatus, usePaginatedRecipients, type StatusFilter } from './usePaginatedRecipients';
import { useSendJob } from './useSendJob';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not_sent', label: 'Not sent' },
  { value: 'sent', label: 'Sent' },
  { value: 'replied', label: 'Replied' },
];

export function EmailCampaignSend({ templates }: { templates: EmailTemplate[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { page, setPage, rows, total, totalPages, loading, error, refresh, rangeStart, rangeEnd } =
    usePaginatedRecipients(statusFilter);
  const [templateType, setTemplateType] = useState<EmailTemplateType>('initial');
  const [selected, setSelected] = useState<Set<string>>(() => loadStoredRecipientSelection());
  const [autoFollowUp, setAutoFollowUp] = useState(false);
  const [selectBusy, setSelectBusy] = useState(false);
  const [previewRecipientId, setPreviewRecipientId] = useState<string>('');
  const [confirmQueueSelectedOpen, setConfirmQueueSelectedOpen] = useState(false);
  const [confirmQueueAllNotSentOpen, setConfirmQueueAllNotSentOpen] = useState(false);
  const {
    job,
    notSentCount,
    busy: jobBusy,
    message: jobMessage,
    setMessage: setJobMessage,
    isProcessing,
    progressPercent,
    startJob,
    cancelJob,
  } = useSendJob();

  useEffect(() => {
    saveStoredRecipientSelection(selected);
  }, [selected]);

  const template = templates.find((t) => t.templateType === templateType);

  const pageSelectedCount = useMemo(
    () => rows.filter((r) => selected.has(r.id)).length,
    [rows, selected]
  );

  const previewRecipient = useMemo(() => {
    if (previewRecipientId) {
      return rows.find((r) => r.id === previewRecipientId) ?? rows[0];
    }
    const firstSelected = rows.find((r) => selected.has(r.id));
    return firstSelected ?? rows[0];
  }, [previewRecipientId, rows, selected]);

  useEffect(() => {
    if (previewRecipient && previewRecipientId !== previewRecipient.id) {
      setPreviewRecipientId(previewRecipient.id);
    }
  }, [previewRecipient, previewRecipientId]);

  const previewVars = useMemo(() => {
    if (previewRecipient) return recipientToVars(previewRecipient);
    return { firstName: 'Alex', companyName: 'Acme GmbH', industry: 'SaaS' };
  }, [previewRecipient]);

  const previewHtml = useMemo(() => {
    if (!template) return '';
    return applyTemplateVars(template.bodyHtml, previewVars);
  }, [template, previewVars]);

  const previewSubject = useMemo(() => {
    if (!template) return '';
    return applyTemplateVars(template.subject, previewVars);
  }, [template, previewVars]);

  const previewToLabel = previewRecipient
    ? `${previewRecipient.contactName || 'Contact'} <${previewRecipient.email}>`
    : undefined;

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
    clearStoredRecipientSelection();
  }

  async function selectAllNotSent() {
    setSelectBusy(true);
    try {
      const ids = await fetchRecipientIdsByStatus('not_sent');
      setSelected(new Set(ids));
    } catch (e) {
      setJobMessage((e as Error).message);
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
      setJobMessage((e as Error).message);
    } finally {
      setSelectBusy(false);
    }
  }

  function requestQueueSelected() {
    if (!selected.size) {
      setJobMessage('Select at least one recipient in Step 2.');
      return;
    }
    setConfirmQueueSelectedOpen(true);
  }

  async function queueSelectedConfirmed() {
    setConfirmQueueSelectedOpen(false);
    try {
      await startJob({
        templateType,
        autoFollowUp,
        selectionMode: 'recipient_ids',
        recipientIds: [...selected],
      });
      clearSelection();
      await refresh();
    } catch (e) {
      setJobMessage((e as Error).message);
    }
  }

  async function queueAllNotSentConfirmed() {
    setConfirmQueueAllNotSentOpen(false);
    try {
      await startJob({
        templateType,
        autoFollowUp,
        selectionMode: 'all_not_sent',
      });
      await refresh();
    } catch (e) {
      setJobMessage((e as Error).message);
    }
  }

  async function runAutoFollowUps() {
    setJobMessage('');
    try {
      const res = await fetch('/api/admin/email-marketing/follow-ups', { method: 'POST' });
      const data = (await res.json()) as {
        error?: string;
        followUp1?: { sent: number; failed: number } | null;
        followUp2?: { sent: number; failed: number } | null;
      };
      if (!res.ok) throw new Error(data.error || 'Failed');
      const p1 = data.followUp1 ? `FU1: ${data.followUp1.sent} sent` : 'FU1: none due';
      const p2 = data.followUp2 ? `FU2: ${data.followUp2.sent} sent` : 'FU2: none due';
      setJobMessage(`${p1}. ${p2}.`);
      notifyRecipientsChanged();
      await refresh();
    } catch (e) {
      setJobMessage((e as Error).message);
    }
  }

  const busy = jobBusy || isProcessing;

  return (
    <div className="space-y-6">
      {job ? (
        <SendJobProgressBanner
          job={job}
          progressPercent={progressPercent}
          busy={jobBusy}
          onCancel={() => void cancelJob()}
        />
      ) : null}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Step 1 — Template type (one per campaign)</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(TEMPLATE_LABELS) as EmailTemplateType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTemplateType(type)}
              className={
                templateType === type
                  ? 'rounded-lg bg-[#0e7490] px-4 py-2 text-sm font-semibold text-white dark:bg-cyan-600'
                  : 'rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground'
              }
            >
              {TEMPLATE_LABELS[type]}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoFollowUp}
            onChange={(e) => setAutoFollowUp(e.target.checked)}
            disabled={templateType !== 'initial'}
          />
          Auto follow-up (3 days → follow-up 1, ~5 days after FU1 → follow-up 2) when sending initial only
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Step 2 — Recipients</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {total.toLocaleString()} companies{statusFilter !== 'all' ? ` (${statusFilter.replace('_', ' ')})` : ''}.
          Status becomes <strong className="text-foreground">Sent</strong> only after SMTP succeeds. Each successful
          send is BCC’d to your sending mailbox (<code className="text-xs">EMAIL_USER</code>, or{' '}
          <code className="text-xs">EMAIL_CAMPAIGN_BCC</code>) — check Gmail <strong>Sent</strong> or Inbox. See{' '}
          <a href="/admin/email-marketing/logs" className="font-semibold text-[#0e7490] underline dark:text-cyan-300">
            Logs
          </a>
          . Set <code className="text-xs">EMAIL_CAMPAIGN_BCC=false</code> to disable copies.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
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
        </div>
        <div className="mt-3 space-y-3">
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
            busy={busy || selectBusy || loading || isProcessing}
            onSelectPage={togglePage}
            onClear={clearSelection}
            onSelectNotSent={() => void selectAllNotSent()}
            onSelectSent={() => void selectAllSent()}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border p-2 text-sm">
            {loading && rows.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">Add companies on the Companies tab first.</p>
            ) : (
              rows.map((r) => (
                <label key={r.id} className="flex cursor-pointer items-center gap-2 py-1">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                  <span>
                    {r.contactName || r.email} — {r.companyName} ({r.status})
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 dark:bg-cyan-500/10">
        <h3 className="text-sm font-semibold text-foreground">Step 3 — HTML preview before send</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the exact email layout (white inbox view). Variables are filled for the recipient below.
        </p>
        {rows.length > 0 ? (
          <label className="mt-3 block text-sm">
            <span className="font-medium text-foreground">Preview as recipient (current page)</span>
            <select
              value={previewRecipient?.id ?? ''}
              onChange={(e) => setPreviewRecipientId(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-border bg-background px-3 py-2"
            >
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.contactName || r.email} — {r.companyName}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="mt-4">
          {template ? (
            <EmailHtmlPreview
              subject={previewSubject}
              bodyHtml={previewHtml}
              toLabel={previewToLabel}
              note="This is the HTML customers receive. Plain-text fallback is generated automatically when sent."
            />
          ) : (
            <p className="text-sm text-muted-foreground">Template not loaded.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || notSentCount === 0}
          onClick={() => setConfirmQueueAllNotSentOpen(true)}
          className="rounded-lg bg-[#0e7490] px-6 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-cyan-600"
        >
          {isProcessing
            ? 'Sending in background…'
            : `Queue all not sent (${notSentCount.toLocaleString()})`}
        </button>
        <button
          type="button"
          disabled={busy || !selected.size}
          onClick={() => requestQueueSelected()}
          className="rounded-lg border border-[#0e7490] px-6 py-2 text-sm font-semibold text-[#0e7490] disabled:opacity-50 dark:border-cyan-500 dark:text-cyan-300"
        >
          Queue selected ({selected.size.toLocaleString()})
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void runAutoFollowUps()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
        >
          Process due auto follow-ups
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Sends run in the background in small batches (no timeout). Progress updates above. Run{' '}
        <code className="text-xs">supabase/email_marketing_jobs_schema.sql</code> once if jobs fail to create.
      </p>

      {jobMessage ? <p className="text-sm text-foreground">{jobMessage}</p> : null}

      <AdminConfirmModal
        open={confirmQueueAllNotSentOpen}
        title="Queue send to all not sent?"
        description={`Queue "${TEMPLATE_LABELS[templateType]}" for ${notSentCount.toLocaleString()} companies with status Not sent? Emails send in the background; you do not need to click Send repeatedly.`}
        confirmLabel="Queue & send"
        cancelLabel="Cancel"
        busy={jobBusy}
        onConfirm={() => void queueAllNotSentConfirmed()}
        onClose={() => setConfirmQueueAllNotSentOpen(false)}
      />

      <AdminConfirmModal
        open={confirmQueueSelectedOpen}
        title="Queue send to selected?"
        description={`Queue "${TEMPLATE_LABELS[templateType]}" for ${selected.size.toLocaleString()} selected recipient(s)? Sends run in the background.`}
        confirmLabel="Queue & send"
        cancelLabel="Cancel"
        busy={jobBusy}
        onConfirm={() => void queueSelectedConfirmed()}
        onClose={() => setConfirmQueueSelectedOpen(false)}
      />
    </div>
  );
}
