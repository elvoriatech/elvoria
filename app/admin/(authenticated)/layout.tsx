import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';
import { AdminHeader } from '../_components/AdminHeader';

export default async function AdminAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  if (!verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <AdminHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
