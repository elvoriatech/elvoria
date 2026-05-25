'use client';

type Props = {
  selectedCount: number;
  pageSelectedCount: number;
  pageRowCount: number;
  busy?: boolean;
  onSelectPage: () => void;
  onClear: () => void;
  onSelectNotSent: () => void;
  onSelectSent?: () => void;
};

export function RecipientSelectionToolbar({
  selectedCount,
  pageSelectedCount,
  pageRowCount,
  busy,
  onSelectPage,
  onClear,
  onSelectNotSent,
  onSelectSent,
}: Props) {
  const allPageSelected = pageRowCount > 0 && pageSelectedCount === pageRowCount;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount.toLocaleString()} selected total
        {pageRowCount > 0 ? ` (${pageSelectedCount} on this page)` : ''}
      </span>
      <button
        type="button"
        disabled={busy || pageRowCount === 0}
        onClick={onSelectPage}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
      >
        {allPageSelected ? 'Deselect page' : 'Select page'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onSelectNotSent}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
      >
        Select all not sent
      </button>
      {onSelectSent ? (
        <button
          type="button"
          disabled={busy}
          onClick={onSelectSent}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          Select all sent
        </button>
      ) : null}
      <button
        type="button"
        disabled={busy || selectedCount === 0}
        onClick={onClear}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
      >
        Clear
      </button>
    </div>
  );
}
