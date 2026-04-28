import { Trophy, Rocket, Shield, TrendingUp, Users, Zap } from 'lucide-react';

export function WhyChooseUs() {
  const reasons = [
    {
      icon: Rocket,
      title: "Modern Tech, Not Legacy Code",
      description: "While other agencies still push WordPress and jQuery, we build with React, Next.js, and AI-first architecture. Your product will be modern, scalable, and maintainable for years to come."
    },
    {
      icon: TrendingUp,
      title: "Business Outcomes, Not Just Features",
      description: "We don't just ship code—we drive results. Every decision is tied to KPIs: faster load times = higher conversions, better UX = lower churn, AI automation = cost savings."
    },
    {
      icon: Zap,
      title: "Performance Obsessed",
      description: "Sub-second load times, 99.99% uptime, auto-scaling infrastructure. We optimize every millisecond because we know performance directly impacts your bottom line."
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "GDPR compliance, SOC 2 readiness, penetration testing, and security audits. We build with security in mind from day one, not as an afterthought."
    },
    {
      icon: Users,
      title: "Senior Developers Only",
      description: "No junior developers learning on your dime. Our team averages 7+ years of experience with proven track records in scaling applications to millions of users."
    },
    {
      icon: Trophy,
      title: "Transparent & Communicative",
      description: "No surprises, no hidden costs, no scope creep. Daily updates, shared tools, and clear documentation. You'll always know exactly where your project stands."
    }
  ];

  return (
    <section className="py-24 bg-background dark:bg-linear-to-b dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-6 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-transparent">
            Why Choose Elvoriatech
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're not your typical software agency. Here's what makes us different
            in a crowded market of mediocre development shops.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border/60 bg-card/90 hover:bg-card transition-all group dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 dark:border-white/10"
            >
              <div className="w-12 h-12 bg-linear-to-br from-(--brand-accent) to-(--brand-primary) rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <reason.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl mb-3 text-foreground">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl border border-border/60 bg-card/80 dark:bg-linear-to-r dark:from-purple-900/30 dark:to-blue-900/30 dark:border-white/10">
          <h3 className="text-3xl mb-6 text-center text-foreground">
            The Elvoriatech Advantage
          </h3>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-2 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-transparent">
                50% Faster
              </div>
              <div className="text-muted-foreground">Time to market vs traditional agencies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-transparent">
                3x Better
              </div>
              <div className="text-muted-foreground">Performance than industry average</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-transparent">
                98% Success
              </div>
              <div className="text-muted-foreground">Project completion rate on time & budget</div>
            </div>
          </div>

          <div className="bg-foreground/3 p-6 rounded-xl border border-border/60 dark:bg-slate-900/50 dark:border-white/10">
            <h4 className="text-xl mb-4 text-foreground">Outdated Agencies vs Elvoriatech</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-red-400">❌ WordPress & jQuery</div>
                <div className="text-red-400">❌ Monolithic architecture</div>
                <div className="text-red-400">❌ Manual deployments</div>
                <div className="text-red-400">❌ Junior developers</div>
                <div className="text-red-400">❌ Fixed-scope waterfall</div>
              </div>
              <div className="space-y-2">
                <div className="text-emerald-600 dark:text-green-400">✅ React, Next.js & AI-first</div>
                <div className="text-emerald-600 dark:text-green-400">✅ Microservices & serverless</div>
                <div className="text-emerald-600 dark:text-green-400">✅ Automated CI/CD pipelines</div>
                <div className="text-emerald-600 dark:text-green-400">✅ Senior engineers only</div>
                <div className="text-emerald-600 dark:text-green-400">✅ Agile with continuous delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
