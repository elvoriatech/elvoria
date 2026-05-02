'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/proposals', label: 'AI proposals' },
] as const;

export function AdminHeader() {
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <header className="border-b border-border bg-card/90 px-4 py-4 shadow-sm backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Image
              src="/elvoria.png"
              alt="Elvoria Tech"
              width={40}
              height={40}
              className="h-9 w-9 rounded-lg sm:h-10 sm:w-10"
              priority
            />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Admin</h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">Support leads and AI proposal PDFs</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <nav className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1" aria-label="Admin sections">
            {nav.map(({ href, label }) => {
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
          <button
            type="button"
            onClick={() => void logout()}
            className="shrink-0 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-muted"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
