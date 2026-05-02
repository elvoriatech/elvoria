import { Award, Lock, MapPin, Shield } from 'lucide-react';

export function SovereigntyBar() {
  const sovereignty = [
    { icon: MapPin, text: 'Global Experienced Engineers', subtext: 'Distributed Expert Team' },
    { icon: Shield, text: 'GDPR/DSGVO Compliant', subtext: 'Data Privacy by Design' },
    { icon: Lock, text: 'Enterprise Security', subtext: 'Bank-Grade Protection' },
    { icon: Award, text: 'World-Class Engineering', subtext: 'Excellence & Quality' },
  ] as const;

  return (
    <div className="bg-card border-y border-border/60 dark:bg-[#1E293B] dark:border-slate-700/50">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4 md:gap-6">
          {sovereignty.map((item, index) => (
            <div key={index} className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#06B6D4] to-[#3B82F6] sm:h-10 sm:w-10">
                <item.icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground sm:text-sm dark:text-[#F8FAFC]">{item.text}</div>
                <div className="text-[11px] text-muted-foreground sm:text-xs dark:text-slate-400">{item.subtext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

