'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail, Send, TextQuote, User } from 'lucide-react';
import {
  buildFullMarketingEmailHtml,
  marketingLogoUrlForPreview,
} from '@/lib/emailMarketing/emailLayout';

/** Renders the full branded HTML email (logo, header, footer) as customers receive it. */
export function EmailHtmlPreview({
  subject,
  bodyHtml,
  toLabel,
  fromLabel = 'Elvoria Technologies <contact@elvoriatech.com>',
  note,
  className = '',
  matchedHeight,
}: {
  subject: string;
  bodyHtml: string;
  toLabel?: string;
  fromLabel?: string;
  note?: string;
  className?: string;
  /** Lock preview column height (e.g. match editor column). Applied after mount only. */
  matchedHeight?: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [srcDoc, setSrcDoc] = useState('');
  const [iframeContentHeight, setIframeContentHeight] = useState(400);

  useEffect(() => {
    setReady(true);
    setSrcDoc(
      buildFullMarketingEmailHtml(bodyHtml, {
        logoSrc: marketingLogoUrlForPreview(),
        preheader: subject,
      })
    );
  }, [bodyHtml, subject]);

  useEffect(() => {
    if (!ready) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const measure = () => {
      try {
        const doc = iframe.contentDocument;
        const body = doc?.body;
        const root = doc?.documentElement;
        if (!body || !root) return;
        const h = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          root.scrollHeight,
          root.offsetHeight
        );
        setIframeContentHeight(Math.max(400, h + 8));
      } catch {
        setIframeContentHeight(400);
      }
    };

    iframe.addEventListener('load', measure);
    measure();
    return () => iframe.removeEventListener('load', measure);
  }, [srcDoc, ready]);

  const heightStyle =
    ready && matchedHeight != null && matchedHeight > 0
      ? { height: matchedHeight, minHeight: matchedHeight, maxHeight: matchedHeight }
      : undefined;

  return (
    <div
      className={`flex flex-col space-y-3 overflow-hidden ${className}`.trim()}
      style={heightStyle}
      suppressHydrationWarning
    >
      <div className="flex shrink-0 items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-[#0e7490] dark:bg-cyan-500/15 dark:text-cyan-400"
          aria-hidden
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-foreground">HTML preview (branded — as sent)</h3>
          {note ? <p className="text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-slate-100 shadow-lg ring-1 ring-border/60 dark:bg-slate-900/50">
        <div className="shrink-0 border-b border-border bg-card px-4 py-3 text-xs">
          <dl className="space-y-2.5">
            <div className="flex gap-2.5">
              <dt className="flex w-14 shrink-0 items-center gap-1.5 font-semibold text-foreground/70">
                <User className="h-3.5 w-3.5 shrink-0 text-[#0e7490] dark:text-cyan-400" aria-hidden />
                From
              </dt>
              <dd className="min-w-0 flex-1 text-foreground">{fromLabel}</dd>
            </div>
            {toLabel ? (
              <div className="flex gap-2.5">
                <dt className="flex w-14 shrink-0 items-center gap-1.5 font-semibold text-foreground/70">
                  <Send className="h-3.5 w-3.5 shrink-0 text-[#0e7490] dark:text-cyan-400" aria-hidden />
                  To
                </dt>
                <dd className="min-w-0 flex-1 text-foreground">{toLabel}</dd>
              </div>
            ) : null}
            <div className="flex gap-2.5">
              <dt className="flex w-14 shrink-0 items-center gap-1.5 font-semibold text-foreground/70">
                <TextQuote className="h-3.5 w-3.5 shrink-0 text-[#0e7490] dark:text-cyan-400" aria-hidden />
                Subject
              </dt>
              <dd className="min-w-0 flex-1 font-medium text-foreground">{subject || '(no subject)'}</dd>
            </div>
          </dl>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f1f5f9] p-4 dark:bg-slate-900/60">
          {ready && srcDoc ? (
            <iframe
              ref={iframeRef}
              title="Email HTML preview"
              srcDoc={srcDoc}
              style={{ height: iframeContentHeight }}
              className="mx-auto block w-full max-w-[600px] rounded-2xl border-0 bg-transparent shadow-none"
              sandbox="allow-same-origin"
            />
          ) : (
            <div
              className="mx-auto flex h-full min-h-[320px] w-full max-w-[600px] items-center justify-center rounded-2xl bg-muted/30 text-sm text-muted-foreground"
              aria-hidden
            >
              Loading preview…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
