import { Award, Lock, MapPin, Shield } from 'lucide-react';

export function SovereigntyBar() {
  const sovereignty = [
    { icon: MapPin, text: 'Global Senior Engineers', subtext: 'Distributed Expert Team' },
    { icon: Shield, text: 'GDPR/DSGVO Compliant', subtext: 'Data Privacy by Design' },
    { icon: Lock, text: 'Enterprise Security', subtext: 'Bank-Grade Protection' },
    { icon: Award, text: 'World-Class Engineering', subtext: 'Excellence & Quality' },
  ] as const;

  return (
    <div className="bg-[#1E293B] border-y border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sovereignty.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F8FAFC]">{item.text}</div>
                <div className="text-xs text-slate-400">{item.subtext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

