'use client';

import type { ReactNode } from 'react';
import { openContactInquiry, type ContactInquiryPreset } from '@/lib/elvoriaEvents';

export function ContactInquiryTrigger({
  className,
  children,
  preset,
  'aria-label': ariaLabel,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  preset?: ContactInquiryPreset;
  'aria-label'?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel ?? (typeof children === 'string' ? children : 'Open project inquiry form')}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) openContactInquiry(preset);
      }}
    >
      {children}
    </button>
  );
}
