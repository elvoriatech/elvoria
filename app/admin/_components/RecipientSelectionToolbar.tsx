'use client';

type Props = {
  selectedCount: number;
  pageSelectedCount: number;
  pageRowCount: number;
  busy?: boolean;
  hint?: string;
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
  hint,
  onSelectPage,
  onClear,
  onSelectNotSent,
  onSelectSent,
}: Props) {
  const allPageSelected = pageRowCount > 0 && pageSelectedCount === pageRowCount;

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {selectedCount.toLocaleString()} selected
            {pageRowCount > 0 ? (
              <span className="font-normal text-muted-foreground">
                {' '}
                · {pageSelectedCount} on this page
              </span>
            ) : null}
          </p>
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || pageRowCount === 0}
            onClick={onSelectPage}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
          >
            {allPageSelected ? 'Deselect page' : 'Select page'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onSelectNotSent}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
          >
            Select all not sent
          </button>
          {onSelectSent ? (
            <button
              type="button"
              disabled={busy}
              onClick={onSelectSent}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
            >
              Select all sent
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy || selectedCount === 0}
            onClick={onClear}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
