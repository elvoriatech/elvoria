import { TRUST_PILLARS } from '@/lib/trustPillars';
import { TrustPillarIconBox } from './TrustPillarIconBox';

export function SovereigntyBar() {
  return (
    <div className="border-y border-border/60 bg-card dark:border-slate-700/50 dark:bg-[#1E293B]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {TRUST_PILLARS.map((item, index) => (
            <div key={item.title} className="flex gap-3 sm:gap-3.5">
              <TrustPillarIconBox iconId={item.icon} index={index} size="md" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground sm:text-[15px] dark:text-[#F8FAFC]">
                  {item.title}
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground sm:text-xs dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
