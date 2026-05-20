'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { applyTemplateVars, recipientToVars } from '@/lib/emailMarketing/templateVars';
import type { EmailRecipient, EmailTemplate, EmailTemplateType } from '@/lib/emailMarketing/types';
import { TEMPLATE_LABELS } from '@/lib/emailMarketing/types';
import { AdminConfirmModal } from './AdminConfirmModal';
import { EmailHtmlPreview } from './EmailHtmlPreview';

export function EmailCampaignSend({
  recipients,
  templates,
}: {
  recipients: EmailRecipient[];
  templates: EmailTemplate[];
}) {
  const router = useRouter();
  const [templateType, setTemplateType] = useState<EmailTemplateType>('initial');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [autoFollowUp, setAutoFollowUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [previewRecipientId, setPreviewRecipientId] = useState<string>('');
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  const template = templates.find((t) => t.templateType === templateType);

  const previewRecipient = useMemo(() => {
    if (previewRecipientId) {
      return recipients.find((r) => r.id === previewRecipientId) ?? recipients[0];
    }
    const firstSelected = recipients.find((r) => selected.has(r.id));
    return firstSelected ?? recipients[0];
  }, [previewRecipientId, recipients, selected]);

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

  function requestSend() {
    if (!selected.size) {
      setResult('Select at least one recipient in Step 2.');
      return;
    }
    setConfirmSendOpen(true);
  }

  async function sendConfirmed() {
    const ids = [...selected];
    setConfirmSendOpen(false);
    setBusy(true);
    setResult('');
    try {
      const res = await fetch('/api/admin/email-marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType, recipientIds: ids, autoFollowUp }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        failed?: number;
        errors?: string[];
      };
      if (!res.ok) throw new Error(data.error || 'Send failed');
      const errLines = data.errors?.length ? ` Errors: ${data.errors.slice(0, 3).join('; ')}` : '';
      setResult(`Sent ${data.sent ?? 0}, failed ${data.failed ?? 0}.${errLines}`);
      router.refresh();
    } catch (e) {
      setResult((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function runAutoFollowUps() {
    setBusy(true);
    setResult('');
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
      setResult(`${p1}. ${p2}.`);
      router.refresh();
    } catch (e) {
      setResult((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
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
          Select who receives this campaign ({recipients.length} in list).
        </p>
        <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-border p-2 text-sm">
          {recipients.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">Add companies on the Companies tab first.</p>
          ) : (
            recipients.map((r) => (
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

      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 dark:bg-cyan-500/10">
        <h3 className="text-sm font-semibold text-foreground">Step 3 — HTML preview before send</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the exact email layout (white inbox view). Variables are filled for the recipient below.
        </p>
        {recipients.length > 0 ? (
          <label className="mt-3 block text-sm">
            <span className="font-medium text-foreground">Preview as recipient</span>
            <select
              value={previewRecipient?.id ?? ''}
              onChange={(e) => setPreviewRecipientId(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-border bg-background px-3 py-2"
            >
              {recipients.map((r) => (
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
          disabled={busy || !selected.size}
          onClick={() => requestSend()}
          className="rounded-lg bg-[#0e7490] px-6 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-cyan-600"
        >
          {busy ? 'Sending…' : `Send emails (${selected.size} selected)`}
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

      {result ? <p className="text-sm text-foreground">{result}</p> : null}

      <AdminConfirmModal
        open={confirmSendOpen}
        title="Send campaign emails?"
        description={`Send "${TEMPLATE_LABELS[templateType]}" to ${selected.size} recipient(s)? This cannot be undone.`}
        confirmLabel="Send emails"
        cancelLabel="Cancel"
        busy={busy}
        onConfirm={() => void sendConfirmed()}
        onClose={() => setConfirmSendOpen(false)}
      />
    </div>
  );
}
