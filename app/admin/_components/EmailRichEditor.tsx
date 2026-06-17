'use client';

import { Link2 } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { ELVORIA_WEBSITE_URL } from '@/lib/emailMarketing/constants';

export function EmailRichEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const syncHtml = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const exec = useCallback(
    (cmd: string, arg?: string) => {
      ref.current?.focus();
      document.execCommand(cmd, false, arg);
      syncHtml();
    },
    [syncHtml]
  );

  /** Only official site URL — no custom link dialog. */
  function insertWebsiteLink() {
    ref.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
      exec('createLink', ELVORIA_WEBSITE_URL);
      return;
    }
    document.execCommand(
      'insertHTML',
      false,
      `<a href="${ELVORIA_WEBSITE_URL}">elvoria.tech</a>`
    );
    syncHtml();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
        <button type="button" className="rounded px-2 py-1 text-xs font-semibold hover:bg-background" onClick={() => exec('bold')}>
          Bold
        </button>
        <button type="button" className="rounded px-2 py-1 text-xs font-semibold hover:bg-background" onClick={() => exec('italic')}>
          Italic
        </button>
        <button type="button" className="rounded px-2 py-1 text-xs font-semibold hover:bg-background" onClick={() => exec('insertUnorderedList')}>
          List
        </button>
        <button
          type="button"
          title={`Link to ${ELVORIA_WEBSITE_URL}`}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold hover:bg-background"
          onClick={insertWebsiteLink}
        >
          <Link2 className="h-3.5 w-3.5" aria-hidden />
          Website link
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[280px] rounded-xl border border-border bg-background px-4 py-3 text-[15px] leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={syncHtml}
        data-placeholder={placeholder}
      />

      <p className="text-xs text-muted-foreground">
        Variables: <code>[First Name]</code>, <code>[Company Name]</code>, <code>[Industry]</code>. Links use{' '}
        <a href={ELVORIA_WEBSITE_URL} className="text-[#0e7490] underline dark:text-cyan-300">
          {ELVORIA_WEBSITE_URL}
        </a>{' '}
        only.
      </p>
    </div>
  );
}
