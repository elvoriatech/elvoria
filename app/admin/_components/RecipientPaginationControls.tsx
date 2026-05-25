'use client';

type Props = {
  page: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

export function RecipientPaginationControls({
  page,
  totalPages,
  total,
  rangeStart,
  rangeEnd,
  loading,
  onPageChange,
}: Props) {
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        Showing {rangeStart}–{rangeEnd} of {total.toLocaleString()}
        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border px-3 py-1.5 font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-border px-3 py-1.5 font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
