import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';
import { isEmailMarketingReady, isEmailMarketingSchemaApplied } from '@/lib/emailMarketing/store';
import { isCrmReady, isCrmSchemaApplied } from '@/lib/crmStore';
import { AdminHeader } from '../_components/AdminHeader';

export default async function AdminAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  if (!verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect('/admin/login');
  }

  const envReady = isCrmReady();
  const schemaApplied = envReady ? await isCrmSchemaApplied() : false;
  const emailEnvReady = isEmailMarketingReady();
  const emailSchemaApplied = emailEnvReady ? await isEmailMarketingSchemaApplied() : false;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <AdminHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {!envReady ? (
          <div
            className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-foreground"
            role="status"
          >
            CRM database is not fully configured. Set <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
            <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code>, and <code className="text-xs">DATA_ENCRYPTION_KEY</code>,
            then run <code className="text-xs">supabase/crm_schema.sql</code> in the Supabase SQL editor (EU region recommended).
          </div>
        ) : null}
        {envReady && !schemaApplied ? (
          <div
            className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-foreground"
            role="alert"
          >
            Supabase is connected, but CRM tables are missing. Open{' '}
            <strong>Supabase → SQL Editor</strong>, paste the full file{' '}
            <code className="text-xs">supabase/crm_schema.sql</code> from this repo, click <strong>Run</strong>, then refresh
            this page. (Error you may see: <code className="text-xs">PGRST205 … crm_proposal_versions</code>.)
          </div>
        ) : null}
        {emailEnvReady && !emailSchemaApplied ? (
          <div
            className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-foreground"
            role="alert"
          >
            Email Marketing tables are missing. Run <code className="text-xs">supabase/email_marketing_schema.sql</code> in
            Supabase SQL Editor, then refresh.
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
