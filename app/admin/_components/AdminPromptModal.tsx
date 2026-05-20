'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export function AdminPromptModal({
  open,
  title,
  description,
  label,
  defaultValue = '',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  inputType = 'text',
  busy = false,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  label: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
  inputType?: 'text' | 'email';
  busy?: boolean;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-prompt-title"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/65" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 shadow-2xl sm:p-7 dark:border-slate-700/80 dark:bg-[#1E293B]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted/60"
          onClick={onClose}
          disabled={busy}
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <h2 id="admin-prompt-title" className="pr-8 text-lg font-bold text-foreground dark:text-[#F8FAFC]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">{description}</p>
        ) : null}
        <label className="mt-4 block text-sm font-medium text-foreground">
          {label}
          <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit(value);
              }
              if (e.key === 'Escape') onClose();
            }}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-600 dark:bg-[#0F172A]"
          />
        </label>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubmit(value)}
            className="flex-1 rounded-lg bg-linear-to-r from-[#06B6D4] to-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Please wait…' : submitLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted/50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
