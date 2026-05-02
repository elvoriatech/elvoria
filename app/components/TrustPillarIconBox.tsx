import type { LucideIcon } from 'lucide-react';
import { Globe, ShieldCheck, Users, Workflow } from 'lucide-react';
import type { TrustPillarIconId } from '@/lib/trustPillars';

const ICONS: Record<TrustPillarIconId, LucideIcon> = {
  globe: Globe,
  users: Users,
  shield: ShieldCheck,
  workflow: Workflow,
};

/** Matches About / brand cards — cyan, violet, blue rotations. */
const GRADIENTS = [
  'bg-linear-to-br from-[#06B6D4] to-[#3B82F6]',
  'bg-linear-to-br from-[#8B5CF6] to-[#06B6D4]',
  'bg-linear-to-br from-[#3B82F6] to-[#8B5CF6]',
  'bg-linear-to-br from-[#06B6D4] to-[#8B5CF6]',
] as const;

type Size = 'sm' | 'md';

const sizeClass: Record<Size, { box: string; icon: string }> = {
  sm: { box: 'h-8 w-8 rounded-md', icon: 'h-3.5 w-3.5' },
  md: { box: 'h-9 w-9 rounded-lg sm:h-10 sm:w-10', icon: 'h-4 w-4 sm:h-[18px] sm:w-[18px]' },
};

export function TrustPillarIconBox({
  iconId,
  index,
  size = 'md',
}: {
  iconId: TrustPillarIconId;
  index: number;
  size?: Size;
}) {
  const Icon = ICONS[iconId];
  const g = GRADIENTS[index % GRADIENTS.length];
  const s = sizeClass[size];
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${s.box} ${g}`}
      aria-hidden
    >
      <Icon className={`${s.icon} text-white`} strokeWidth={2} />
    </div>
  );
}
