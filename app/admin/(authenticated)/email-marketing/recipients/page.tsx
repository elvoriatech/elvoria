import { isEmailMarketingReady, isEmailMarketingSchemaApplied } from '@/lib/emailMarketing/store';
import { EmailRecipientsManager } from '../../../_components/EmailRecipientsManager';

export default async function EmailRecipientsPage() {
  if (!isEmailMarketingReady() || !(await isEmailMarketingSchemaApplied())) {
    return (
      <p className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-8 text-center text-sm">
        Run <code className="text-xs">supabase/email_marketing_schema.sql</code> in Supabase SQL Editor, then refresh.
      </p>
    );
  }
  return <EmailRecipientsManager />;
}
