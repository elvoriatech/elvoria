'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Records public site page views (not admin). */
export function SiteAnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    const path = pathname;
    void fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
