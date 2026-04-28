import { Search, FileText, Palette, Code, TestTube2, Rocket, HeadphonesIcon } from 'lucide-react';

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
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Our Development Process
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Agile methodology meets strategic planning. Transparent, collaborative,
            and designed to deliver exceptional results on time and on budget.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500 hidden md:block"></div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-6">
                  {/* Icon circle */}
                  <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all">
                      <h3 className="text-2xl mb-3 text-purple-300">{step.title}</h3>
                      <p className="text-lg text-slate-300 mb-4">{step.description}</p>

                      <div className="space-y-2">
                        <div className="text-sm text-slate-400">Key Deliverables:</div>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {step.deliverables.map((deliverable, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-300">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
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

        <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl">
          <h3 className="text-2xl mb-4 text-purple-300">Agile & Collaborative</h3>
          <p className="text-lg text-slate-300 mb-4">
            We believe in radical transparency and close collaboration. You're not just a client—you're a partner in the process.
          </p>
          <ul className="grid md:grid-cols-2 gap-3 text-slate-300">
            <li>✓ Daily standups and regular demos</li>
            <li>✓ Shared Slack channel for real-time communication</li>
            <li>✓ Access to project management tools (Jira/Linear)</li>
            <li>✓ Bi-weekly sprint reviews and planning</li>
            <li>✓ Continuous integration and deployment</li>
            <li>✓ Regular feedback loops and iterations</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
