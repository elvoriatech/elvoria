'use client';

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { applyTemplateVars } from '@/lib/emailMarketing/templateVars';
import type { EmailTemplate, EmailTemplateType } from '@/lib/emailMarketing/types';
import { TEMPLATE_LABELS } from '@/lib/emailMarketing/types';
import { AdminConfirmModal } from './AdminConfirmModal';
import { EmailHtmlPreview } from './EmailHtmlPreview';
import { EmailRichEditor } from './EmailRichEditor';

const SAMPLE_VARS = { firstName: 'Alex', companyName: 'Acme GmbH', industry: 'SaaS' };

export function EmailTemplatesManager({ initial }: { initial: EmailTemplate[] }) {
  const [templates, setTemplates] = useState(initial);
  const [active, setActive] = useState<EmailTemplateType>('initial');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const editorColumnRef = useRef<HTMLDivElement>(null);
  const [pairHeight, setPairHeight] = useState<number | null>(null);
  const [heightsReady, setHeightsReady] = useState(false);

  const current = templates.find((t) => t.templateType === active) ?? templates[0];

  useLayoutEffect(() => {
    const el = editorColumnRef.current;
    if (!el) return;

    const measure = () => {
      setPairHeight(el.offsetHeight);
      setHeightsReady(true);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [active, current?.subject, current?.bodyHtml]);

  const updateField = useCallback(
    (field: 'subject' | 'bodyHtml', value: string) => {
      setTemplates((list) =>
        list.map((t) => (t.templateType === active ? { ...t, [field]: value } : t))
      );
    },
    [active]
  );

  const previewSubject = useMemo(
    () => (current ? applyTemplateVars(current.subject, SAMPLE_VARS) : ''),
    [current]
  );

  const previewHtml = useMemo(
    () => (current ? applyTemplateVars(current.bodyHtml, SAMPLE_VARS) : ''),
    [current]
  );

  async function save() {
    if (!current) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/email-marketing/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: current.templateType,
          subject: current.subject,
          bodyHtml: current.bodyHtml,
        }),
      });
      const data = (await res.json()) as { error?: string; template?: EmailTemplate };
      if (!res.ok) throw new Error(data.error || 'Save failed');
      if (data.template) {
        setTemplates((list) =>
          list.map((t) => (t.templateType === data.template!.templateType ? data.template! : t))
        );
      }
      setMsg('Saved — this is your live version used when sending campaigns.');
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function resetToDefault() {
    if (!current) return;
    setConfirmResetOpen(false);
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/email-marketing/templates/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: current.templateType }),
      });
      const data = (await res.json()) as { error?: string; template?: EmailTemplate };
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      if (data.template) {
        setTemplates((list) =>
          list.map((t) => (t.templateType === data.template!.templateType ? data.template! : t))
        );
      }
      setMsg('Reset to factory default.');
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!current) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TEMPLATE_LABELS) as EmailTemplateType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActive(type)}
            className={
              active === type
                ? 'rounded-lg bg-[#0e7490] px-4 py-2 text-sm font-semibold text-white dark:bg-cyan-600'
                : 'rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground'
            }
          >
            {TEMPLATE_LABELS[type]}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">Factory defaults</strong> stay in the app (always available).{' '}
        <strong className="text-foreground">Save template</strong> stores your edited version in the database for
        campaigns. <strong className="text-foreground">Reset to default</strong> restores the factory text for the
        active tab only. Preview on the right always shows the branded layout (logo + footer).
      </p>

      <div
        className="grid gap-8 lg:grid-cols-2 lg:items-stretch"
        style={
          heightsReady && pairHeight
            ? ({ ['--editor-pair-h' as string]: `${pairHeight}px` } as CSSProperties)
            : undefined
        }
      >
        <div
          ref={editorColumnRef}
          className="flex flex-col space-y-4 lg:min-h-[var(--editor-pair-h)]"
        >
          <label className="block text-sm font-medium text-foreground">
            Subject
            <input
              value={current.subject}
              onChange={(e) => updateField('subject', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <EmailRichEditor key={active} value={current.bodyHtml} onChange={(html) => updateField('bodyHtml', html)} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="rounded-lg bg-[#0e7490] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-cyan-600"
            >
              {busy ? 'Saving…' : 'Save template'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmResetOpen(true)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
            >
              Reset to default
            </button>
            {msg ? <span className="text-sm text-muted-foreground">{msg}</span> : null}
          </div>
        </div>

        <EmailHtmlPreview
          className="lg:h-[var(--editor-pair-h)]"
          matchedHeight={heightsReady && pairHeight ? pairHeight : undefined}
          subject={previewSubject}
          bodyHtml={previewHtml}
          toLabel="Alex Müller <alex@acme.example.com> (sample)"
          note="Sample placeholders — actual sends use each company’s name, company, and industry."
        />
      </div>

      <AdminConfirmModal
        open={confirmResetOpen}
        title="Reset to factory default?"
        description={
          current
            ? `Reset "${TEMPLATE_LABELS[current.templateType]}" to the built-in default? Your saved edits for this template will be replaced.`
            : ''
        }
        confirmLabel="Reset template"
        cancelLabel="Cancel"
        variant="destructive"
        busy={busy}
        onConfirm={() => void resetToDefault()}
        onClose={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
