import { ExternalLink, TrendingUp, Zap, Users } from 'lucide-react';

const projects = [
  {
    title: "IntelliChat AI",
    category: "AI-Powered SaaS Platform",
    description: "An enterprise AI assistant platform that automates customer support and internal operations using GPT-4 and custom ML models.",
    challenge: "A B2B SaaS company needed to reduce support costs while improving response times and customer satisfaction.",
    solution: "Built a multi-tenant AI platform with custom training capabilities, sentiment analysis, and seamless CRM integration.",
    technologies: ["Next.js", "Node.js", "OpenAI API", "PostgreSQL", "AWS Lambda", "Redis"],
    results: [
      { metric: "87%", label: "Reduction in support tickets" },
      { metric: "2.4s", label: "Average response time" },
      { metric: "$450K", label: "Annual cost savings" },
      { metric: "94%", label: "Customer satisfaction" }
    ],
    image: "https://images.unsplash.com/photo-1770171323762-7b9a517a7094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    title: "CloudScale Analytics",
    category: "Scalable Cloud Application",
    description: "A real-time analytics platform processing millions of events per day with sub-second query performance.",
    challenge: "A fintech startup needed to process and analyze massive datasets in real-time while keeping infrastructure costs under control.",
    solution: "Designed a serverless, event-driven architecture using AWS Lambda, DynamoDB, and Elasticsearch with auto-scaling capabilities.",
    technologies: ["React", "AWS Lambda", "DynamoDB", "Elasticsearch", "Kinesis", "CloudFront"],
    results: [
      { metric: "10M+", label: "Events processed daily" },
      { metric: "450ms", label: "P95 query latency" },
      { metric: "60%", label: "Infrastructure cost reduction" },
      { metric: "99.99%", label: "Uptime achieved" }
    ],
    image: "https://images.unsplash.com/photo-1667984390553-7f439e6ae401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  },
  {
    title: "VelocityCommerce",
    category: "High-Performance E-Commerce",
    description: "A headless e-commerce platform with advanced personalization, achieving 3x faster page loads than competitors.",
    challenge: "An online retailer was losing sales due to slow page loads and needed a modern, performant solution.",
    solution: "Built a headless architecture with Next.js, implemented edge caching, image optimization, and AI-powered product recommendations.",
    technologies: ["Next.js", "Shopify API", "Stripe", "Vercel Edge", "Tailwind", "AI Recommendations"],
    results: [
      { metric: "0.8s", label: "Average page load" },
      { metric: "42%", label: "Conversion rate increase" },
      { metric: "156%", label: "Mobile revenue growth" },
      { metric: "3.2x", label: "Performance improvement" }
    ],
    image: "https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  }
];

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Real projects, real results. See how we've helped businesses scale, optimize,
            and dominate their markets with modern technology.
          </p>
        </div>

        <div className="space-y-12">
          {projects.map((project, index) => (
            <div
              key={index}
              className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <div className="inline-block px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-4">
                    {project.category}
                  </div>

                  <h3 className="text-3xl mb-4 text-purple-300">{project.title}</h3>
                  <p className="text-lg text-slate-300 mb-6">{project.description}</p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300">Challenge</span>
                      </div>
                      <p className="text-slate-300">{project.challenge}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-300">Solution</span>
                      </div>
                      <p className="text-slate-300">{project.solution}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm text-slate-400 mb-2">Tech Stack:</div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {project.results.map((result, i) => (
                      <div key={i} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                        <div className="text-2xl mb-1 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {result.metric}
                        </div>
                        <div className="text-sm text-slate-400">{result.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                      <span>View Case Study</span>
                      <ExternalLink className="w-4 h-4" />
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
