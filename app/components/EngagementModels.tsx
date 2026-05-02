import { ArrowRight, Briefcase, CheckCircle, X } from 'lucide-react';

type EngagementCard = {
  name: string;
  description: string;
  price: string;
  /** Shown under price (e.g. per developer, per project) */
  priceSubtext?: string;
  bestFor: string[];
  features: { text: string; included: boolean }[];
  idealLine: string;
  cta: string;
  highlight?: boolean;
  badge?: string;
};

export function EngagementModels() {
  const models: EngagementCard[] = [
    {
      name: 'Dedicated Product Team',
      description: 'Build and scale your product with an experienced engineering team',
      price: 'From €8,000 – €12,000',
      priceSubtext: '/ month per developer',
      bestFor: ['SaaS product development', 'Long-term scaling', 'Continuous feature delivery'],
      features: [
        { text: 'Experienced engineers only', included: true },
        { text: 'Full-time dedicated team', included: true },
        { text: 'Agile sprint-based delivery', included: true },
        { text: 'Direct Slack communication', included: true },
        { text: 'Architecture & scalability focus', included: true },
        { text: 'Continuous improvement', included: true },
      ],
      idealLine: 'Ideal for startups serious about growth',
      cta: 'Book a Dedicated Team Call',
      highlight: true,
      badge: 'Most Popular',
    },
    {
      name: 'Fixed Scope Projects',
      description: 'Defined scope. Predictable delivery. No surprises.',
      price: 'From €25,000 – €40,000+',
      priceSubtext: 'per project',
      bestFor: ['MVP development', 'Feature-based builds', 'Product launches'],
      features: [
        { text: 'Clear requirements & planning', included: true },
        { text: 'Fixed milestones', included: true },
        { text: 'Experienced-led execution', included: true },
        { text: 'End-to-end delivery', included: true },
        { text: 'QA & testing included', included: true },
        { text: 'Transparent timelines', included: true },
      ],
      idealLine: 'Perfect for launching validated ideas fast',
      cta: 'Get Project Estimate',
      highlight: false,
    },
    {
      name: 'Flexible Engineering & Consulting',
      description: 'On-demand experienced expertise when you need it',
      price: '€70 – €120',
      priceSubtext: '/ hour',
      bestFor: ['Prototyping', 'Technical audits', 'API integrations', 'Debugging & optimization'],
      features: [
        { text: 'Pay-as-you-go model', included: true },
        { text: 'Fast onboarding', included: true },
        { text: 'Weekly progress updates', included: true },
        { text: 'Transparent tracking', included: true },
        { text: 'Experienced-level problem solving', included: true },
      ],
      idealLine: 'Ideal for flexible or short-term needs',
      cta: 'Start Consultation',
      highlight: false,
    },
  ];

  return (
    <section className="py-24 bg-background dark:bg-linear-to-b dark:from-[#1E293B] dark:to-[#0F172A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full mb-6">
            <Briefcase className="w-4 h-4 text-[#8B5CF6]" aria-hidden />
            <span className="text-sm text-[#8B5CF6] font-semibold tracking-wide">ENGAGEMENT MODELS</span>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-linear-to-r from-foreground to-[#3B82F6] bg-clip-text text-transparent font-bold">
            Choose Your Engagement Model
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Flexible collaboration tailored to your product, timeline, and budget
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {models.map((model, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all duration-300 ${
                model.highlight
                  ? 'border-[#06B6D4] bg-linear-to-b from-[#06B6D4]/10 to-muted/30 shadow-xl shadow-[#06B6D4]/10 dark:to-[#1E293B] dark:shadow-[#06B6D4]/20'
                  : 'border-border/60 bg-card hover:border-border dark:border-slate-700/50 dark:bg-[#1E293B] dark:hover:border-slate-600'
              }`}
            >
              {model.badge ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-[#8B5CF6] to-[#06B6D4] rounded-full">
                  <span className="text-sm font-bold text-white">{model.badge}</span>
                </div>
              ) : null}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground dark:text-[#F8FAFC] mb-2">{model.name}</h3>
                <p className="text-muted-foreground dark:text-slate-400 mb-4 text-sm leading-relaxed">
                  {model.description}
                </p>
                <div className="mb-1">
                  <div className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-[#06B6D4] to-[#3B82F6] bg-clip-text text-transparent">
                    {model.price}
                  </div>
                  {model.priceSubtext ? (
                    <div className="text-sm font-semibold text-muted-foreground dark:text-slate-400 mt-1">
                      {model.priceSubtext}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-[#06B6D4] mb-2">Best for</div>
                <ul className="text-sm text-muted-foreground dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  {model.bestFor.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className="text-sm font-semibold text-[#06B6D4] mb-3">What you get</div>
              <div className="space-y-3 mb-6 flex-1">
                {model.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <CheckCircle className="w-5 h-5 text-[#06B6D4] mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-muted-foreground dark:text-slate-300 text-sm'
                          : 'text-muted-foreground/55 dark:text-slate-600 text-sm'
                      }
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mb-6 flex items-start gap-2 border-t border-border/40 pt-4 text-sm text-muted-foreground dark:border-slate-700 dark:text-slate-400">
                <ArrowRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-foreground/80 dark:text-slate-200"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{model.idealLine}</span>
              </p>

              <button
                type="button"
                className={`mt-auto w-full py-4 rounded-lg font-semibold transition-all ${
                  model.highlight
                    ? 'bg-linear-to-r from-[#06B6D4] to-[#3B82F6] text-white hover:shadow-lg hover:shadow-[#06B6D4]/30'
                    : 'bg-background border border-border/60 text-foreground hover:border-[#06B6D4]/50 dark:bg-[#0F172A] dark:border-slate-700 dark:text-[#F8FAFC]'
                }`}
              >
                {model.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-linear-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 border border-border/60 rounded-2xl text-center dark:border-[#06B6D4]/30">
          <h3 className="text-2xl font-bold text-foreground dark:text-[#F8FAFC] mb-4">Not Sure Which Model Fits?</h3>
          <p className="text-lg text-muted-foreground dark:text-slate-300 mb-6 max-w-2xl mx-auto">
            Schedule a free 30-minute consultation with our team to discuss your project requirements and find the
            right engagement model.
          </p>
          <button
            type="button"
            className="px-8 py-4 bg-linear-to-r from-[#06B6D4] to-[#3B82F6] rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-[#06B6D4]/30 transition-all"
          >
            Schedule Free Consultation
          </button>
        </div>
      </div>
    </section>
  );
}
