import Link from 'next/link';
import { readSupportLeads } from '@/lib/supportLeads';
import { AdminLeadsTable } from '../../_components/AdminLeadsTable';

export default async function AdminDashboardPage() {
  const leads = await readSupportLeads();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Support leads</h2>
        <p className="mt-1 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Contact details captured before the proposal assistant opens. For finalized AI proposals and PDF delivery, use{' '}
          <Link
            href="/admin/proposals"
            className="font-medium text-[#0e7490] underline decoration-[#06B6D4]/50 hover:text-[#0891b2] dark:text-cyan-300"
          >
            AI proposals
          </Link>
          .
        </p>
      </div>
      <AdminLeadsTable leads={leads} />
    </div>
  );
}
