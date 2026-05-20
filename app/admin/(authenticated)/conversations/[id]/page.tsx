import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConversationDetailForAdmin, isCrmReady, isCrmSchemaApplied } from '@/lib/crmStore';
import { formatAdminTimestamp } from '@/lib/formatAdminTimestamp';
import { AdminConversationFollowUp } from '../../../_components/AdminConversationFollowUp';

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isCrmReady() || !(await isCrmSchemaApplied())) {
    return (
      <p className="text-muted-foreground">
        CRM is not ready. See <code>docs/CRM_SUPABASE.md</code> and run <code>supabase/crm_schema.sql</code>.
      </p>
    );
  }

  const { id } = await params;
  const detail = await getConversationDetailForAdmin(id);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/conversations"
          className="text-sm font-medium text-[#0e7490] underline decoration-[#06B6D4]/40 hover:text-[#0891b2] dark:text-cyan-300"
        >
          ← All conversations
        </Link>
        <h2 className="mt-2 text-lg font-bold text-foreground">
          {detail.visitorName || 'Visitor'}{' '}
          <span className="font-normal text-muted-foreground">
            {detail.visitorEmail ? `· ${detail.visitorEmail}` : ''}
          </span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {detail.company || 'No company'} · {detail.messageCount} messages · updated{' '}
          {formatAdminTimestamp(detail.updatedAt)}
          {detail.source ? ` · source ${detail.source}` : ''}
        </p>
      </div>

      {detail.leadId ? (
        <AdminConversationFollowUp
          conversationId={detail.conversationId}
          initialStatus={detail.followUpStatus}
          initialNotes={detail.followUpNotes}
          initialNextAt={detail.followUpNextAt}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          No lead record linked — visitor may not have completed the gate form.
        </p>
      )}

      {detail.proposalVersions.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Proposals</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {detail.proposalVersions.map((v) => (
              <li key={v.versionId}>
                <span className="font-mono text-xs text-muted-foreground">{v.versionId.slice(0, 8)}…</span>{' '}
                · PDF {v.pdfStatus}
                {v.pdfFilePresent ? (
                  <>
                    {' '}
                    ·{' '}
                    <a
                      href={`/api/admin/proposal-pdf/${v.versionId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#0e7490] underline dark:text-cyan-300"
                    >
                      View PDF
                    </a>
                  </>
                ) : null}
                {' '}
                · {formatAdminTimestamp(v.finalizedAt)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Transcript</h3>
        <div className="mt-4 max-h-[min(70vh,640px)] space-y-4 overflow-y-auto pr-2">
          {detail.messages.map((m, i) => (
            <div
              key={`${m.ts}-${i}`}
              className={
                m.role === 'user'
                  ? 'rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3'
                  : 'rounded-lg border border-border bg-muted/30 px-4 py-3'
              }
            >
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                {m.role === 'user' ? 'Visitor' : 'Assistant'} · {formatAdminTimestamp(m.ts)}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{m.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
