export function TechStack() {
  const technologies = {
    "Frontend": [
      { name: "React", desc: "Modern UI library" },
      { name: "Next.js", desc: "React framework for production" },
      { name: "Angular", desc: "Enterprise applications" },
      { name: "Tailwind CSS", desc: "Utility-first styling" },
      { name: "TypeScript", desc: "Type-safe JavaScript" }
    ],
    "Backend": [
      { name: "Node.js", desc: "JavaScript runtime" },
      { name: "Spring Boot", desc: "Java framework" },
      { name: "Express.js", desc: "Web framework" },
      { name: "GraphQL", desc: "API query language" },
      { name: "REST APIs", desc: "Web services" }
    ],
    "Cloud & DevOps": [
      { name: "AWS", desc: "Lambda, S3, CloudFront, EC2" },
      { name: "Docker", desc: "Containerization" },
      { name: "Kubernetes", desc: "Container orchestration" },
      { name: "GitHub Actions", desc: "CI/CD automation" },
      { name: "Terraform", desc: "Infrastructure as code" }
    ],
    "Databases": [
      { name: "PostgreSQL", desc: "Relational database" },
      { name: "MongoDB", desc: "NoSQL database" },
      { name: "Redis", desc: "In-memory cache" },
      { name: "DynamoDB", desc: "AWS NoSQL" },
      { name: "Elasticsearch", desc: "Search engine" }
    ],
    "AI & Testing": [
      { name: "OpenAI API", desc: "GPT integration" },
      { name: "Claude API", desc: "Anthropic AI" },
      { name: "Playwright", desc: "E2E testing" },
      { name: "Jest", desc: "Unit testing" },
      { name: "Cypress", desc: "Component testing" }
    ],
    "Mobile": [
      { name: "React Native", desc: "Cross-platform apps" },
      { name: "Flutter", desc: "Google's UI toolkit" },
      { name: "iOS Native", desc: "Swift development" },
      { name: "Android Native", desc: "Kotlin development" },
      { name: "Expo", desc: "React Native framework" }
    ]
  };

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Modern Technology Stack
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            We work exclusively with cutting-edge, production-ready technologies that ensure
            scalability, performance, and long-term maintainability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(technologies).map(([category, techs]) => (
            <div key={category} className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/20 rounded-xl">
              <h3 className="text-2xl mb-6 text-purple-300">{category}</h3>
              <div className="space-y-4">
                {techs.map((tech) => (
                  <div key={tech.name} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="text-slate-200">{tech.name}</div>
                      <div className="text-sm text-slate-400">{tech.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1667984390535-6d03cff0b11a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Cloud infrastructure"
              className="w-full h-64 object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h4 className="text-3xl mb-4 text-white">Cloud-Native by Default</h4>
                <p className="text-lg text-slate-200">
                  Every project is architected for AWS cloud infrastructure, ensuring scalability and reliability
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
