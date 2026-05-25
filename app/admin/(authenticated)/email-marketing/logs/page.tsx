import { formatAdminTimestamp } from '@/lib/formatAdminTimestamp';
import {
  isEmailMarketingReady,
  isEmailMarketingSchemaApplied,
  listCampaigns,
  listSendLogs,
} from '@/lib/emailMarketing/store';
import { TEMPLATE_LABELS } from '@/lib/emailMarketing/types';

export default async function EmailLogsPage() {
  if (!isEmailMarketingReady() || !(await isEmailMarketingSchemaApplied())) {
    return (
      <p className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-8 text-center text-sm">
        Run <code className="text-xs">supabase/email_marketing_schema.sql</code> in Supabase SQL Editor, then refresh.
      </p>
    );
  }

  const [logs, campaigns] = await Promise.all([listSendLogs(500), listCampaigns(30)]);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent campaigns</h3>
        {campaigns.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No campaigns yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Template</th>
                  <th className="px-3 py-2">Recipients</th>
                  <th className="px-3 py-2">Sent</th>
                  <th className="px-3 py-2">Failed</th>
                  <th className="px-3 py-2">Auto FU</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap">{formatAdminTimestamp(c.createdAt)}</td>
                    <td className="px-3 py-2">{TEMPLATE_LABELS[c.templateType]}</td>
                    <td className="px-3 py-2">{c.recipientCount}</td>
                    <td className="px-3 py-2 text-emerald-600">{c.sentCount}</td>
                    <td className="px-3 py-2 text-destructive">{c.failedCount}</td>
                    <td className="px-3 py-2">{c.autoFollowUp ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Send log</h3>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No sends logged yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Template</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap">{formatAdminTimestamp(l.sentAt)}</td>
                    <td className="px-3 py-2">{l.email}</td>
                    <td className="px-3 py-2">{TEMPLATE_LABELS[l.templateType]}</td>
                    <td className="px-3 py-2 capitalize">{l.status}</td>
                    <td className="px-3 py-2 max-w-xs truncate text-muted-foreground">{l.errorMessage || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
