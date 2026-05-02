import { Check, Code, FileText, HeadphonesIcon, Palette, Rocket, Search, TestTube2 } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: "Discovery",
    description: "We dive deep into your business goals, target audience, and technical requirements. Understanding the 'why' behind your project.",
    deliverables: ["Requirements documentation", "Technical feasibility analysis", "Project roadmap"]
  },
  {
    icon: FileText,
    title: "Planning",
    description: "Detailed sprint planning, architecture design, and resource allocation. We set clear milestones and success metrics.",
    deliverables: ["Architecture diagrams", "Sprint breakdown", "Risk assessment", "Timeline & budget"]
  },
  {
    icon: Palette,
    title: "Design",
    description: "User-centric UI/UX design with wireframes, prototypes, and design systems. We validate with user testing before development.",
    deliverables: ["Wireframes & mockups", "Interactive prototypes", "Design system", "User flow maps"]
  },
  {
    icon: Code,
    title: "Development",
    description: "Agile development with 2-week sprints. Daily standups, regular demos, and continuous integration ensure transparency.",
    deliverables: ["Working software increments", "Code reviews", "Progress reports", "Demo sessions"]
  },
  {
    icon: TestTube2,
    title: "Testing",
    description: "Comprehensive QA including unit tests, integration tests, E2E automation, performance testing, and security audits.",
    deliverables: ["Automated test suites", "QA reports", "Performance benchmarks", "Security audit"]
  },
  {
    icon: Rocket,
    title: "Deployment",
    description: "Zero-downtime deployments with automated CI/CD pipelines. Cloud infrastructure setup and monitoring configuration.",
    deliverables: ["Production deployment", "CI/CD pipelines", "Monitoring setup", "Documentation"]
  },
  {
    icon: HeadphonesIcon,
    title: "Support",
    description: "Ongoing maintenance, bug fixes, performance optimization, and feature enhancements. We're in it for the long haul.",
    deliverables: ["24/7 monitoring", "Bug fixes", "Monthly reports", "Feature updates"]
  }
];

export function Process() {
  return (
    <section className="bg-background py-16 sm:py-20 md:py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-5 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-3xl text-transparent sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Our Development Process
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Agile methodology meets strategic planning. Transparent, collaborative,
            and designed to deliver exceptional results on time and on budget.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-linear-to-b from-(--brand-primary) via-(--brand-accent) to-(--brand-primary) hidden md:block opacity-70"></div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-6">
                  {/* Icon circle */}
                  <div className="relative z-10 w-16 h-16 bg-linear-to-br from-(--brand-accent) to-(--brand-primary) rounded-full flex items-center justify-center shrink-0 shadow-sm dark:shadow-none">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="p-6 rounded-xl border border-border/60 bg-card/90 hover:bg-card transition-all dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 dark:border-white/10">
                      <h3 className="text-2xl mb-3 text-foreground">{step.title}</h3>
                      <p className="text-lg text-muted-foreground mb-4">{step.description}</p>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Key Deliverables:</div>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {step.deliverables.map((deliverable, i) => (
                            <li key={i} className="flex items-center gap-2 text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-(--brand-accent) rounded-full"></div>
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-8 rounded-2xl border border-border/60 bg-card/80 dark:bg-linear-to-r dark:from-purple-900/20 dark:to-blue-900/20 dark:border-white/10">
          <h3 className="text-2xl mb-4 text-foreground">Agile & Collaborative</h3>
          <p className="text-lg text-muted-foreground mb-4">
            We believe in radical transparency and close collaboration. You&apos;re not just a client—you&apos;re a partner in the process.
          </p>
          <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
            {[
              'Daily standups and regular demos',
              'Shared Slack channel for real-time communication',
              'Access to project management tools (Jira/Linear)',
              'Bi-weekly sprint reviews and planning',
              'Continuous integration and deployment',
              'Regular feedback loops and iterations',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--brand-accent)" strokeWidth={2.5} aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
