import { CheckCircle, X } from 'lucide-react';

export function EngagementModels() {
  const models = [
    {
      name: 'Fixed Scope',
      description: 'Defined deliverables with fixed timeline and budget',
      price: 'From €50,000',
      bestFor: 'Well-defined projects with clear requirements',
      features: [
        { text: 'Detailed specification upfront', included: true },
        { text: 'Fixed budget and timeline', included: true },
        { text: 'Milestone-based payments', included: true },
        { text: 'Change request process', included: true },
        { text: 'Flexible scope changes', included: false },
        { text: 'Pay only for time used', included: false },
      ],
      highlight: false,
    },
    {
      name: 'Dedicated Team',
      description: 'Senior engineers exclusively for your project',
      price: 'From €12,000/month',
      bestFor: 'Long-term product development and scaling',
      features: [
        { text: 'Hand-picked senior developers', included: true },
        { text: 'Full-time commitment', included: true },
        { text: 'Direct Slack communication', included: true },
        { text: 'Flexible team size (2-10)', included: true },
        { text: 'Flexible scope changes', included: true },
        { text: 'Monthly billing', included: true },
      ],
      highlight: true,
      badge: 'Most Popular',
    },
    {
      name: 'Flexible Hourly',
      description: 'Pay-as-you-go for exploratory and consulting work',
      price: '€95-€150/hour',
      bestFor: 'Prototypes, consulting, uncertain scope',
      features: [
        { text: 'Hourly billing', included: true },
        { text: 'No long-term commitment', included: true },
        { text: 'Weekly reports', included: true },
        { text: 'Transparent time tracking', included: true },
        { text: 'Fixed budget guarantee', included: false },
        { text: 'Dedicated resources', included: false },
      ],
      highlight: false,
    },
  ] as const;

  return (
    <section className="py-24 bg-linear-to-b from-[#1E293B] to-[#0F172A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full mb-6">
            <span className="text-sm text-[#3B82F6] font-semibold">PARTNERSHIP MODELS</span>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-linear-to-r from-[#F8FAFC] to-[#3B82F6] bg-clip-text text-transparent font-bold">
            Choose Your Engagement Model
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light">
            Flexible collaboration tailored to your project needs and timeline
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {models.map((model, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                model.highlight
                  ? 'border-[#06B6D4] bg-linear-to-b from-[#06B6D4]/10 to-[#1E293B] shadow-xl shadow-[#06B6D4]/20'
                  : 'border-slate-700/50 bg-[#1E293B] hover:border-slate-600'
              }`}
            >
              {'badge' in model && model.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-[#06B6D4] to-[#3B82F6] rounded-full">
                  <span className="text-sm font-bold text-white">{model.badge}</span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#F8FAFC] mb-2">{model.name}</h3>
                <p className="text-slate-400 mb-4">{model.description}</p>
                <div className="text-3xl font-bold bg-linear-to-r from-[#06B6D4] to-[#3B82F6] bg-clip-text text-transparent mb-2">
                  {model.price}
                </div>
                <div className="text-sm text-slate-400">per developer</div>
              </div>

              <div className="mb-8">
                <div className="text-sm font-semibold text-[#06B6D4] mb-4">BEST FOR:</div>
                <p className="text-slate-300">{model.bestFor}</p>
              </div>

              <div className="space-y-3 mb-8">
                {model.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <CheckCircle className="w-5 h-5 text-[#06B6D4] mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
                    )}
                    <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={`w-full py-4 rounded-lg font-semibold transition-all ${
                  model.highlight
                    ? 'bg-linear-to-r from-[#06B6D4] to-[#3B82F6] text-white hover:shadow-lg hover:shadow-[#06B6D4]/30'
                    : 'bg-[#0F172A] border border-slate-700 text-[#F8FAFC] hover:border-[#06B6D4]/50'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-linear-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-[#F8FAFC] mb-4">Not Sure Which Model Fits?</h3>
          <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
            Schedule a free 30-minute consultation with our solution architects to discuss your project
            requirements and find the perfect engagement model.
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
