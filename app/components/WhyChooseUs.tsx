import { MessagesSquare, Rocket, Shield, TrendingUp, Users, Zap } from 'lucide-react';

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
      title: "Experienced Engineers Only",
      description:
        "Experienced engineers with proven track records—we focus on depth, not using your product as a training ground. Our team averages 7+ years of experience scaling applications to millions of users.",
    },
    {
      icon: MessagesSquare,
      title: "Transparent & Communicative",
      description: "No surprises, no hidden costs, no scope creep. Daily updates, shared tools, and clear documentation. You'll always know exactly where your project stands."
    }
  ];

  return (
    <section className="bg-background py-16 sm:py-20 md:py-24 dark:bg-linear-to-b dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-5 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-3xl text-transparent sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Why Choose Elvoriatech
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl">
            We&apos;re not your typical software agency. Here&apos;s what makes us different
            in a crowded market of mediocre development shops.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="group rounded-xl border border-border/60 bg-card/90 p-4 transition-all hover:bg-card sm:p-6 dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 dark:border-white/10"
            >
              <div className="w-12 h-12 bg-linear-to-br from-(--brand-accent) to-(--brand-primary) rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <reason.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl mb-3 text-foreground">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-6 md:p-8 dark:bg-linear-to-r dark:from-purple-900/30 dark:to-blue-900/30 dark:border-white/10">
          <h3 className="mb-5 text-center text-2xl text-foreground sm:mb-6 sm:text-3xl">
            The Elvoriatech Advantage
          </h3>

          <div className="mb-8 grid gap-6 md:grid-cols-3 md:gap-8">
            <div className="text-center">
              <div className="mb-2 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-2xl text-transparent sm:text-3xl md:text-4xl">
                50% Faster
              </div>
              <div className="text-muted-foreground">Time to market vs traditional agencies</div>
            </div>
            <div className="text-center">
              <div className="mb-2 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-2xl text-transparent sm:text-3xl md:text-4xl">
                3x Better
              </div>
              <div className="text-muted-foreground">Performance than industry average</div>
            </div>
            <div className="text-center">
              <div className="mb-2 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-2xl text-transparent sm:text-3xl md:text-4xl">
                98% Success
              </div>
              <div className="text-muted-foreground">Project completion rate on time & budget</div>
            </div>
          </div>

          <div className="bg-foreground/3 p-6 rounded-xl border border-border/60 dark:bg-slate-900/50 dark:border-white/10">
            <h4 className="text-xl mb-4 text-foreground">Modern Engineering Approach</h4>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-foreground/80">Legacy systems and rigid architectures</div>
                <div className="text-foreground/80">Manual deployment processes</div>
                <div className="text-foreground/80">Slow delivery cycles</div>
                <div className="text-foreground/80">Fragmented team expertise</div>
                <div className="text-foreground/80">Fixed and inflexible processes</div>
              </div>

              <div className="space-y-2">
                <div className="text-emerald-600 dark:text-green-400">
                  Scalable React, Next.js &amp; AI-first architectures
                </div>
                <div className="text-emerald-600 dark:text-green-400">
                  Automated CI/CD &amp; cloud-native deployments
                </div>
                <div className="text-emerald-600 dark:text-green-400">
                  Fast, iterative delivery with Agile workflows
                </div>
                <div className="text-emerald-600 dark:text-green-400">
                  Experienced engineers focused on system design
                </div>
                <div className="text-emerald-600 dark:text-green-400">
                  Flexible, product-driven development approach
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
