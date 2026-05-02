import { Brain, Cloud, Rocket, Shield, Users, Zap } from 'lucide-react';

const services = [
  {
    icon: Brain,
    name: 'AI-First SaaS Platforms',
    description:
      'Build intelligent, self-learning systems with GPT-4, Claude, and custom ML models. From conversational interfaces to predictive analytics.',
    capabilities: [
      'AI chatbots & virtual assistants',
      'Intelligent document processing',
      'Predictive analytics dashboards',
      'LLM-powered automation',
    ],
    gradient: 'from-[#8B5CF6] to-[#06B6D4]',
  },
  {
    icon: Cloud,
    name: 'DevOps & Automation',
    description:
      'CI/CD pipelines, infrastructure as code, automated testing, and continuous monitoring.',
    capabilities: [
      'GitHub Actions workflows',
      'Docker containerization',
      'Infrastructure as Code (Terraform)',
      'Automated testing suites',
    ],
    gradient: 'from-[#3B82F6] to-[#06B6D4]',
  },
  {
    icon: Rocket,
    name: 'Cloud-Native Architecture',
    description:
      'Serverless, auto-scaling, cost-optimized infrastructure on AWS. Built for European compliance and global performance.',
    capabilities: [
      'AWS Lambda & serverless compute',
      'Microservices architecture',
      'Event-driven systems',
      'Auto-scaling infrastructure',
    ],
    gradient: 'from-[#06B6D4] to-[#3B82F6]',
  },
  {
    icon: Users,
    name: 'Marketplace Platforms',
    description:
      'Multi-tenant B2B and B2C marketplaces with complex matching, payments, and logistics integration.',
    capabilities: [
      'Advanced search & filtering',
      'Payment gateway integration',
      'Multi-vendor management',
      'Real-time analytics',
    ],
    gradient: 'from-[#3B82F6] to-[#8B5CF6]',
  },
  {
    icon: Shield,
    name: 'Mission-Critical Systems',
    description:
      'Aviation, automotive, and financial platforms where 99.99% uptime and zero-downtime deployments are mandatory.',
    capabilities: [
      'High-availability architecture',
      'Real-time monitoring',
      'Disaster recovery planning',
      'Zero-downtime deployments',
    ],
    gradient: 'from-[#06B6D4] to-[#8B5CF6]',
  },
  {
    icon: Zap,
    name: 'Performance Engineering',
    description:
      'Sub-second response times, database optimization, caching strategies, and CDN implementation.',
    capabilities: [
      'Database query optimization',
      'Redis caching strategies',
      'CDN & edge computing',
      'Performance monitoring',
    ],
    gradient: 'from-[#8B5CF6] to-[#3B82F6]',
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="py-24 bg-background dark:bg-linear-to-b dark:from-[#1E293B] dark:to-[#0F172A]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-full mb-6">
            <span className="text-sm text-[#06B6D4] font-semibold">CORE CAPABILITIES</span>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-linear-to-r from-foreground to-[#06B6D4] bg-clip-text text-transparent font-bold">
            Enterprise Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Deep expertise from experienced engineers in AI, cloud architecture, SaaS platforms, and mission-critical
            systems
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-8 bg-card border border-border/60 rounded-xl hover:border-[#06B6D4]/50 transition-all duration-300 dark:bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border-slate-700/50"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-linear-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <service.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3">{service.name}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-[#06B6D4] mb-3">
                  Key Capabilities:
                </div>
                <ul className="space-y-2">
                  {service.capabilities.map((capability, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground dark:text-slate-400">
                      <span className="text-[#06B6D4] mt-1">•</span>
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
