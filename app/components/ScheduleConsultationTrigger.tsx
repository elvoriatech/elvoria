'use client';

import type { ReactNode } from 'react';

const BOOKING_URL =
  typeof process.env.NEXT_PUBLIC_CONSULTATION_BOOKING_URL === 'string'
    ? process.env.NEXT_PUBLIC_CONSULTATION_BOOKING_URL.trim()
    : '';

export function ScheduleConsultationTrigger({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (BOOKING_URL) {
          window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
          return;
        }
        window.dispatchEvent(new CustomEvent('elvoria:open-schedule'));
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    >
      {children}
    </button>
  );
}
