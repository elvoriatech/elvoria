'use client';

import { HardHat, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UnderConstructionDetail } from '@/lib/elvoriaEvents';
import { openProposalChat } from '@/lib/elvoriaEvents';

const DEFAULT_TITLE = 'Portfolio & case studies';
const DEFAULT_DESCRIPTION =
  'We are curating detailed case studies, metrics, and delivery stories. Check back soon—or start a conversation with our AI proposal architect today.';

/** Theme-aware “under construction” dialog; opened via `elvoria:under-construction`. */
export function UnderConstructionModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);

  useEffect(() => {
    function onOpen(e: Event) {
      const ce = e as CustomEvent<UnderConstructionDetail>;
      setTitle(ce.detail?.title?.trim() || DEFAULT_TITLE);
      setDescription(ce.detail?.description?.trim() || DEFAULT_DESCRIPTION);
      setOpen(true);
    }
    window.addEventListener('elvoria:under-construction', onOpen);
    return () => window.removeEventListener('elvoria:under-construction', onOpen);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="under-construction-title"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/65" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 shadow-2xl sm:p-8 dark:border-slate-700/80 dark:bg-[#1E293B] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground dark:hover:bg-slate-800"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#06B6D4]/30 bg-[#06B6D4]/10 dark:border-[#06B6D4]/40 dark:bg-[#06B6D4]/15">
          <HardHat className="h-7 w-7 text-[#06B6D4]" aria-hidden />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8B5CF6] dark:text-[#a78bfa]">
          Under construction
        </p>
        <h2
          id="under-construction-title"
          className="mb-3 pr-8 text-xl font-bold text-foreground sm:text-2xl dark:text-[#F8FAFC]"
        >
          {title}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base dark:text-slate-300">
          {description}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="flex-1 rounded-lg bg-linear-to-r from-[#06B6D4] to-[#3B82F6] px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#06B6D4]/25"
            onClick={() => {
              setOpen(false);
              openProposalChat('hero_start_project');
            }}
          >
            Start your project (AI chat)
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg border border-border/60 bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 dark:border-slate-600 dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
