'use client';

import type { ReactNode } from 'react';
import { openProposalChat, type ProposalChatSource } from '@/lib/elvoriaEvents';

export type { ProposalChatSource };

export function OpenProposalChatTrigger({
  className,
  children,
  source = 'contact_technical_proposal',
  'aria-label': ariaLabel = 'Request technical proposal',
}: {
  className?: string;
  children: ReactNode;
  source?: ProposalChatSource;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() => openProposalChat(source)}
    >
      {children}
    </button>
  );
}
