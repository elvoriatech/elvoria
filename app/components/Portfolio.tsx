import {
  Briefcase,
  Car,
  Clock,
  Euro,
  Plane,
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
      { value: '35%', label: 'Infrastructure Cost ↓', icon: Euro },
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
      className="py-24 bg-linear-to-b from-[#0F172A] to-[#1E293B]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-full mb-6">
            <span className="text-sm text-[#06B6D4] font-semibold">PROVEN IMPACT</span>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-linear-to-r from-[#F8FAFC] to-[#06B6D4] bg-clip-text text-transparent font-bold">
            Enterprise Success Stories
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light">
            KPI-driven results from mission-critical systems deployed across global enterprises
          </p>
        </div>

        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="group p-8 bg-linear-to-br from-[#1E293B] to-[#0F172A] border border-slate-700/50 rounded-2xl hover:border-[#06B6D4]/50 transition-all duration-300"
            >
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-xl bg-linear-to-br ${study.gradient} flex items-center justify-center shrink-0`}
                    >
                      <study.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#F8FAFC] mb-1">{study.name}</h3>
                      <div className="text-sm text-[#06B6D4] font-semibold mb-2">{study.industry}</div>
                      <div className="text-slate-400 italic">{study.tagline}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {study.kpis.map((kpi, i) => (
                      <div key={i} className="p-4 bg-[#0F172A]/50 border border-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <kpi.icon className="w-4 h-4 text-[#06B6D4]" />
                          <div
                            className={`text-2xl font-bold bg-linear-to-r ${study.gradient} bg-clip-text text-transparent`}
                          >
                            {kpi.value}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">{kpi.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[#F8FAFC] mb-3">Challenge &amp; Solution</h4>
                    <p className="text-slate-300 mb-6 leading-relaxed">{study.description}</p>

                    <h4 className="text-lg font-semibold text-[#F8FAFC] mb-3">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {study.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-[#1E293B] border border-[#06B6D4]/30 rounded-lg text-sm text-slate-300 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      type="button"
                      className={`px-6 py-3 bg-linear-to-r ${study.gradient} rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-[#06B6D4]/30 transition-all`}
                    >
                      View Full Case Study
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-[#1E293B] border border-slate-700 rounded-lg font-semibold text-[#F8FAFC] hover:border-[#06B6D4]/50 transition-all"
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
