'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/email-marketing/templates', label: 'Templates' },
  { href: '/admin/email-marketing/recipients', label: 'Companies' },
  { href: '/admin/email-marketing/campaigns', label: 'Send campaign' },
  { href: '/admin/email-marketing/logs', label: 'Logs' },
  { href: '/admin/analytics', label: 'Site analytics' },
] as const;

export function AdminEmailSubnav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1" aria-label="Email marketing">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? 'rounded-md bg-background px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border'
                : 'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
