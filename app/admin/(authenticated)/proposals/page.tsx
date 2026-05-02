import { readProposalFinalizeLogForAdmin } from '@/lib/proposalFinalizeLog';
import { AdminProposalQueue } from '../../_components/AdminProposalQueue';

export default async function AdminAiProposalsPage() {
  const proposalRows = await readProposalFinalizeLogForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">AI-assisted proposals</h2>
        <p className="mt-1 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Every row is a proposal finalized from the on-site <strong className="text-foreground">AI Technical Proposal Architect</strong>.
          The PDF is <strong className="text-foreground">not</strong> attached in an outbound email automatically when generation succeeds — use{' '}
          <strong className="text-foreground">Send PDF by email</strong> unless you deliver it another way. If PDF rendering failed, the visitor may
          have received a short follow-up only when mail is configured; you still send the actual PDF manually once it exists.
        </p>
      </div>
      <AdminProposalQueue rows={proposalRows} />
    </div>
  );
}
