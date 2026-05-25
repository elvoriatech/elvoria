import { isEmailMarketingReady, isEmailMarketingSchemaApplied, listTemplates } from '@/lib/emailMarketing/store';
import { EmailCampaignSend } from '../../../_components/EmailCampaignSend';

export default async function EmailCampaignsPage() {
  if (!isEmailMarketingReady() || !(await isEmailMarketingSchemaApplied())) {
    return (
      <p className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-8 text-center text-sm">
        Run <code className="text-xs">supabase/email_marketing_schema.sql</code> in Supabase SQL Editor, then refresh.
      </p>
    );
  }
  const templates = await listTemplates();
  return <EmailCampaignSend templates={templates} />;
}
