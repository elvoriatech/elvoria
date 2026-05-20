'use client';

import type { ReactNode } from 'react';
import { openScheduleConsultation } from '@/lib/elvoriaEvents';

const BOOKING_URL =
  typeof process.env.NEXT_PUBLIC_CONSULTATION_BOOKING_URL === 'string'
    ? process.env.NEXT_PUBLIC_CONSULTATION_BOOKING_URL.trim()
    : '';

export function ScheduleConsultationTrigger({
  className,
  children,
  'aria-label': ariaLabel = 'Schedule a consultation',
}: {
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        if (BOOKING_URL) {
          window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
          return;
        }
        openScheduleConsultation();
      }}
    >
      {children}
    </button>
  );
}
