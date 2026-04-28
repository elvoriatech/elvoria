import { Bot, Cloud, Smartphone, Code2, Database, Palette, TestTube, Zap, GitBranch, BarChart3, Workflow, Lock } from 'lucide-react';

const services = [
  {
    icon: Bot,
    title: "AI & Generative AI Solutions",
    description: "Build intelligent applications with ChatGPT, Claude, and custom AI models. From AI chatbots and virtual assistants to automation workflows and predictive analytics.",
    useCases: ["Customer support automation", "AI-powered content generation", "Intelligent document processing", "Predictive analytics dashboards"],
    trending: true
  },
  {
    icon: Cloud,
    title: "SaaS Product Development",
    description: "End-to-end SaaS platform development with multi-tenancy, subscription management, analytics, and scalable architecture designed for rapid growth.",
    useCases: ["B2B SaaS platforms", "Subscription-based services", "Multi-tenant applications", "Usage-based billing systems"],
    trending: true
  },
  {
    icon: Code2,
    title: "Web Development",
    description: "Modern, high-performance web applications using React, Next.js, and Angular. Server-side rendering, SEO optimization, and lightning-fast user experiences.",
    useCases: ["Progressive web apps", "E-commerce platforms", "Admin dashboards", "Real-time collaboration tools"],
    trending: false
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Native iOS, Android, and cross-platform mobile apps using React Native and Flutter. Seamless user experiences across all devices.",
    useCases: ["On-demand service apps", "Mobile banking solutions", "Fitness & health tracking", "Social networking platforms"],
    trending: false
  },
  {
    icon: Database,
    title: "Backend & API Development",
    description: "Scalable REST and GraphQL APIs using Node.js, Java Spring Boot, and serverless architectures. Built for performance and reliability.",
    useCases: ["Microservices architecture", "Real-time data APIs", "Third-party integrations", "Legacy system modernization"],
    trending: false
  },
  {
    icon: Workflow,
    title: "Cloud & DevOps",
    description: "AWS cloud infrastructure, serverless computing, containerization with Docker, and automated CI/CD pipelines for rapid, reliable deployments.",
    useCases: ["AWS Lambda functions", "Auto-scaling infrastructure", "Kubernetes orchestration", "Continuous deployment pipelines"],
    trending: true
  },
  {
    icon: GitBranch,
    title: "Microservices Architecture",
    description: "Design and implement distributed systems with microservices, event-driven architecture, and message queues for ultimate scalability.",
    useCases: ["Service mesh implementation", "Event sourcing patterns", "Distributed transactions", "API gateway solutions"],
    trending: true
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Conversion-focused design systems, user research, prototyping, and beautiful interfaces that users love and that drive business metrics.",
    useCases: ["Design system creation", "User journey mapping", "A/B testing optimization", "Mobile-first responsive design"],
    trending: false
  },
  {
    icon: TestTube,
    title: "QA & Test Automation",
    description: "Comprehensive testing strategies with Playwright, Cypress, and Jest. Automated E2E tests integrated into CI/CD pipelines.",
    useCases: ["End-to-end test automation", "Performance testing", "Security testing", "Load & stress testing"],
    trending: false
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description: "Application performance audits, database optimization, caching strategies, and CDN implementation to achieve sub-second load times.",
    useCases: ["Page speed optimization", "Database query tuning", "Code splitting & lazy loading", "CDN & caching strategies"],
    trending: true
  },
  {
    icon: BarChart3,
    title: "API Development & Integrations",
    description: "Seamlessly integrate with third-party services, payment gateways, CRMs, and enterprise systems. Custom API development and management.",
    useCases: ["Payment gateway integration", "CRM & ERP connections", "Marketing automation sync", "Custom webhook systems"],
    trending: false
  },
  {
    icon: Lock,
    title: "Security & Compliance",
    description: "Enterprise-grade security implementation, GDPR compliance, SOC 2 preparation, penetration testing, and security audits.",
    useCases: ["OAuth & SSO implementation", "Data encryption strategies", "Compliance documentation", "Security vulnerability fixes"],
    trending: false
  }
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            High-Demand Services
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Cutting-edge solutions aligned with 2026 market trends. We focus on technologies
            and services that deliver maximum business value and competitive advantage.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl hover:border-purple-500/50 transition-all duration-300 group"
            >
              {service.trending && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-300 mb-4">
                  <Zap className="w-3 h-3" />
                  <span>High Demand 2026</span>
                </div>
              )}

              <div className="w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/20 transition-colors">
                <service.icon className="w-6 h-6 text-purple-400" />
              </div>

              <h3 className="text-xl mb-3 text-purple-300">{service.title}</h3>
              <p className="text-slate-300 mb-4">{service.description}</p>

              <div className="space-y-2">
                <div className="text-sm text-slate-400">Real-world use cases:</div>
                <ul className="space-y-1 text-sm text-slate-400">
                  {service.useCases.map((useCase, i) => (
                    <li key={i}>• {useCase}</li>
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
