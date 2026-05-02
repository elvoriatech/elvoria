import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';
import { AdminHeader } from './AdminHeader';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  if (!verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-background dark:text-foreground">
      <AdminHeader />
      <div className="mx-auto max-w-6xl p-6">{children}</div>
    </div>
  );
}
