'use client';

import { X } from 'lucide-react';

export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const confirmClass =
    variant === 'destructive'
      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      : 'bg-linear-to-r from-[#06B6D4] to-[#3B82F6] text-white hover:shadow-lg hover:shadow-[#06B6D4]/25';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/65" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 shadow-2xl sm:p-7 dark:border-slate-700/80 dark:bg-[#1E293B]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          onClick={onClose}
          disabled={busy}
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <h2 id="admin-confirm-title" className="pr-8 text-lg font-bold text-foreground dark:text-[#F8FAFC]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground dark:text-slate-300">{description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${confirmClass}`}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 dark:border-slate-600 dark:bg-[#0F172A]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
