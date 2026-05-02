import { readProposalFinalizeLogForAdmin } from '@/lib/proposalFinalizeLog';
import { readSupportLeads } from '@/lib/supportLeads';
import { AdminLeadsTable } from './AdminLeadsTable';
import { AdminProposalQueue } from './AdminProposalQueue';

export default async function AdminDashboardPage() {
  const [leads, proposalRows] = await Promise.all([readSupportLeads(), readProposalFinalizeLogForAdmin()]);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-foreground">Proposal PDFs</h2>
        <p className="text-sm text-slate-600 dark:text-muted-foreground">
          Finalized proposals from the AI assistant. Open the PDF when the file is on the server, or email it to the visitor.
        </p>
        <AdminProposalQueue rows={proposalRows} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-foreground">Support leads</h2>
        <p className="text-sm text-slate-600 dark:text-muted-foreground">
          Contact details captured before the proposal chat opens.
        </p>
        <AdminLeadsTable leads={leads} />
      </section>
    </div>
  );
}
