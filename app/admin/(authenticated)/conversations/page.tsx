import Link from 'next/link';
import { isCrmReady, isCrmSchemaApplied, listConversationSummariesForAdmin } from '@/lib/crmStore';
import { formatAdminTimestamp } from '@/lib/formatAdminTimestamp';

export default async function AdminConversationsPage() {
  const canQuery = isCrmReady() && (await isCrmSchemaApplied());

  if (!isCrmReady()) {
    return (
      <p className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-8 text-center text-base text-foreground">
        Configure Supabase and <code className="text-sm">DATA_ENCRYPTION_KEY</code>, then run{' '}
        <code className="text-sm">supabase/crm_schema.sql</code> in your project.
      </p>
    );
  }

  if (!canQuery) {
    return (
      <p className="rounded-xl border border-dashed border-destructive/40 bg-destructive/10 px-4 py-8 text-center text-base text-foreground">
        Run <code className="text-sm">supabase/crm_schema.sql</code> in the Supabase SQL Editor (see alert above), then refresh.
      </p>
    );
  }

  const rows = await listConversationSummariesForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Conversations</h2>
        <p className="mt-1 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Full AI proposal chat transcripts (encrypted at rest). Open a row to review messages, update follow-up status,
          and link to finalized PDFs.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-base text-muted-foreground">
          No conversations yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-md ring-1 ring-border/60">
          <table className="w-full min-w-[900px] text-left text-[15px]">
            <thead className="border-b-2 border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Updated</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Visitor</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Messages</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Follow-up</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Next</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.conversationId} className="border-b border-border last:border-0 odd:bg-card even:bg-muted/25">
                  <td className="px-4 py-3 whitespace-nowrap">{formatAdminTimestamp(row.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{row.visitorName || '—'}</div>
                    <div className="text-sm text-muted-foreground">{row.visitorEmail || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground/90">{row.company || '—'}</td>
                  <td className="px-4 py-3 tabular-nums">{row.messageCount}</td>
                  <td className="px-4 py-3 capitalize text-foreground/90">{row.followUpStatus}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {row.followUpNextAt ? formatAdminTimestamp(row.followUpNextAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/conversations/${row.conversationId}`}
                      className="text-sm font-semibold text-[#0e7490] underline decoration-[#06B6D4]/50 hover:text-[#0891b2] dark:text-cyan-300"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
