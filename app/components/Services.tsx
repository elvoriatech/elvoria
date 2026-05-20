import { Brain, Cloud, Rocket, Shield, Users, Zap } from 'lucide-react';
import Image from 'next/image';

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
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="bg-background py-16 sm:py-20 md:py-24 dark:bg-linear-to-b dark:from-[#1E293B] dark:to-[#0F172A]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-5 inline-block rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3 py-1.5 sm:mb-6 sm:px-4 sm:py-2">
            <span className="text-xs font-semibold text-[#06B6D4] sm:text-sm">CORE CAPABILITIES</span>
          </div>
          <h2 className="mb-5 bg-linear-to-r from-foreground to-[#06B6D4] bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Enterprise Services
          </h2>
          <p className="mx-auto max-w-3xl text-base font-light text-muted-foreground sm:text-lg md:text-xl">
            Deep expertise from experienced engineers in AI, cloud architecture, SaaS platforms, and mission-critical
            systems
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-[#06B6D4]/50 sm:p-6 md:p-8 dark:bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border-slate-700/50"
            >
              <div className="relative h-48 mb-6 overflow-hidden rounded-lg">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <div
                className={`w-14 h-14 rounded-xl bg-linear-to-br ${service.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <service.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">{service.name}</h3>
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
