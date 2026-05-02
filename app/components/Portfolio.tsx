import {
  Briefcase,
  Car,
  Clock,
  Euro,
  Plane,
  TrendingDown,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

const caseStudies = [
  {
    icon: Plane,
    name: 'TravelConnect',
    industry: 'Aviation Technology',
    tagline: 'Mission-Critical Flight Operations Platform',
    description:
      'Real-time flight management system serving airlines with 99.99% uptime requirements and sub-second response times.',
    kpis: [
      { value: '99.99%', label: 'System Uptime', icon: TrendingUp },
      { value: '< 50ms', label: 'Response Time', icon: Clock },
      { value: '€2.3M', label: 'Cost Savings/Year', icon: Euro },
      { value: '15K', label: 'Daily Active Users', icon: Users },
    ],
    technologies: ['Next.js', 'NestJS', 'AWS Lambda', 'PostgreSQL', 'Redis'],
    gradient: 'from-[#06B6D4] to-[#3B82F6]',
  },
  {
    icon: Briefcase,
    name: 'HireFlow',
    industry: 'HR Technology',
    tagline: 'AI-Powered Recruitment Automation',
    description:
      'Intelligent hiring platform leveraging GPT-4 for candidate screening, reducing manual review time by 95%.',
    kpis: [
      { value: '95%', label: 'Time Reduction', icon: Clock },
      { value: '3.2x', label: 'Faster Hiring', icon: TrendingUp },
      { value: '€450K', label: 'Annual Savings', icon: Euro },
      { value: '50K+', label: 'Candidates Processed', icon: Users },
    ],
    technologies: ['React', 'OpenAI GPT-4', 'Node.js', 'MongoDB', 'AWS'],
    gradient: 'from-[#8B5CF6] to-[#06B6D4]',
  },
  {
    icon: UtensilsCrossed,
    name: 'FoodHub SaaS',
    industry: 'Restaurant Technology',
    tagline: 'Complete Restaurant Management Platform',
    description:
      'Multi-tenant SaaS platform for restaurants with digital menus, online ordering, payment processing, delivery tracking, and receipt management.',
    kpis: [
      { value: '500+', label: 'Active Restaurants', icon: Users },
      { value: '85%', label: 'Order Automation', icon: TrendingUp },
      { value: '€3.2M', label: 'Monthly Transactions', icon: Euro },
      { value: '1.2s', label: 'Avg Order Time', icon: Clock },
    ],
    technologies: [
      'Next.js',
      'Stripe API',
      'NestJS',
      'PostgreSQL',
      'AWS Lambda',
      'Real-time DB',
    ],
    gradient: 'from-[#8B5CF6] to-[#06B6D4]',
  },
  {
    icon: Car,
    name: 'MarketHub Pro',
    industry: 'E-Commerce Platform',
    tagline: 'High-Performance Multi-Vendor Marketplace',
    description:
      'Scalable B2B/B2C marketplace platform with real-time inventory, advanced search, and payment integration serving global merchants.',
    kpis: [
      { value: '35%', label: 'Infrastructure cost reduction', icon: TrendingDown },
      { value: '0.8s', label: 'Page Load Time', icon: Clock },
      { value: '€8M', label: 'GMV/Month', icon: TrendingUp },
      { value: '1,800+', label: 'Active Vendors', icon: Users },
    ],
    technologies: ['Next.js', 'Microservices', 'AWS Lambda', 'DynamoDB', 'CloudFront'],
    gradient: 'from-[#3B82F6] to-[#8B5CF6]',
  },
] as const;

export function Portfolio() {
  return (
    <section
      id="portfolio"
      className="bg-background py-16 sm:py-20 md:py-24 dark:bg-linear-to-b dark:from-[#0F172A] dark:to-[#1E293B]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-5 inline-block rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3 py-1.5 sm:mb-6 sm:px-4 sm:py-2">
            <span className="text-xs font-semibold text-[#06B6D4] sm:text-sm">PROVEN IMPACT</span>
          </div>
          <h2 className="mb-5 bg-linear-to-r from-foreground to-[#06B6D4] bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Enterprise Success Stories
          </h2>
          <p className="mx-auto max-w-3xl text-base font-light text-muted-foreground sm:text-lg md:text-xl">
            KPI-driven results from mission-critical systems deployed across global enterprises
          </p>
        </div>

        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-[#06B6D4]/50 sm:p-6 md:p-8 dark:bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border-slate-700/50"
            >
              <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-xl bg-linear-to-br ${study.gradient} flex items-center justify-center shrink-0`}
                    >
                      <study.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-xl font-bold text-foreground sm:text-2xl">{study.name}</h3>
                      <div className="text-sm text-[#06B6D4] font-semibold mb-2">{study.industry}</div>
                      <div className="text-muted-foreground italic">{study.tagline}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {study.kpis.map((kpi, i) => (
                      <div key={i} className="rounded-lg border border-border/60 bg-muted/40 p-2.5 sm:p-4 dark:bg-[#0F172A]/50 dark:border-slate-700/30">
                        <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                          <kpi.icon className="h-3.5 w-3.5 shrink-0 text-[#06B6D4] sm:h-4 sm:w-4" />
                          <div
                            className={`text-lg font-bold bg-linear-to-r sm:text-2xl ${study.gradient} bg-clip-text text-transparent`}
                          >
                            {kpi.value}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-3">Challenge &amp; Solution</h4>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{study.description}</p>

                    <h4 className="text-lg font-semibold text-foreground mb-3">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {study.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-muted/40 border border-border/60 rounded-lg text-sm text-muted-foreground font-medium dark:bg-[#1E293B] dark:border-[#06B6D4]/30 dark:text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      className={`w-full rounded-lg bg-linear-to-r px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#06B6D4]/30 sm:w-auto sm:px-6 sm:py-3 sm:text-base ${study.gradient}`}
                    >
                      View Full Case Study
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg border border-slate-700 bg-[#1E293B] px-5 py-2.5 text-sm font-semibold text-[#F8FAFC] transition-all hover:border-[#06B6D4]/50 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                    >
                      Technical Architecture
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
