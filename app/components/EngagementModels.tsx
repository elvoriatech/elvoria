import { DollarSign, Users, Clock, CheckCircle } from 'lucide-react';

export function EngagementModels() {
  const models = [
    {
      icon: DollarSign,
      title: "Fixed Price",
      description: "Best for well-defined projects with clear scope and requirements",
      features: [
        "Detailed project specification upfront",
        "Fixed budget and timeline",
        "Milestone-based payments",
        "Complete project delivery",
        "3 months post-launch support"
      ],
      bestFor: "MVP development, website redesigns, specific feature implementations",
      pricing: "Starting from $25,000"
    },
    {
      icon: Users,
      title: "Dedicated Team",
      description: "A dedicated team exclusively working on your project",
      features: [
        "Hand-picked senior developers",
        "Full-time commitment to your project",
        "Flexible team size (2-10 members)",
        "Direct communication via Slack",
        "Monthly billing with flexible contracts"
      ],
      bestFor: "Long-term product development, scaling existing platforms, ongoing projects",
      pricing: "From $12,000/month per developer",
      popular: true
    },
    {
      icon: Clock,
      title: "Time & Materials",
      description: "Flexible engagement for evolving requirements and exploratory projects",
      features: [
        "Hourly or weekly billing",
        "Flexibility to change scope",
        "Transparent time tracking",
        "Weekly reports and invoices",
        "No long-term commitment"
      ],
      bestFor: "Prototypes, consulting, uncertain scope, quick turnarounds",
      pricing: "$85-150/hour depending on expertise"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Engagement Models
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Flexible collaboration models designed to fit your project needs,
            timeline, and budget. Choose what works best for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {models.map((model, index) => (
            <div
              key={index}
              className={`p-8 bg-gradient-to-br from-slate-900 to-slate-800 border rounded-2xl hover:border-purple-500/40 transition-all relative ${
                model.popular ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-purple-500/20'
              }`}
            >
              {model.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-sm">
                  Most Popular
                </div>
              )}

              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <model.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl mb-3 text-purple-300">{model.title}</h3>
              <p className="text-slate-300 mb-6">{model.description}</p>

              <div className="mb-6">
                <div className="text-3xl mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {model.pricing}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {model.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-700">
                <div className="text-sm text-slate-400 mb-2">Best for:</div>
                <p className="text-slate-300">{model.bestFor}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl">
          <h3 className="text-2xl mb-4 text-purple-300">Not Sure Which Model Fits?</h3>
          <p className="text-lg text-slate-300 mb-6">
            Schedule a free 30-minute consultation call with our team. We'll discuss your project,
            timeline, and budget to recommend the best engagement model for your needs.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            Schedule Free Consultation
          </button>
        </div>
      </div>
    </section>
  );
}
