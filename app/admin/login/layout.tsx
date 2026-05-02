import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

export default async function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  if (verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect('/admin/dashboard');
  }
  return children;
}
