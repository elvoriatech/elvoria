/* eslint-disable @next/next/no-img-element */
'use client';

import { Brain, Cloud, Code2, Server, Shield } from 'lucide-react';
import { useState } from 'react';

export function TechStack() {
  const techCategories = [
    {
      id: 'frontend',
      icon: Code2,
      name: 'Frontend',
      color: 'from-[#06B6D4] to-[#3B82F6]',
      technologies: [
        { name: 'Next.js', level: 'Expert', description: 'Production-grade React framework' },
        { name: 'React', level: 'Expert', description: 'Component-based UI library' },
        { name: 'TypeScript', level: 'Expert', description: 'Type-safe development' },
        { name: 'Tailwind CSS', level: 'Expert', description: 'Utility-first styling' },
      ],
    },
    {
      id: 'backend',
      icon: Server,
      name: 'Backend',
      color: 'from-[#8B5CF6] to-[#06B6D4]',
      technologies: [
        { name: 'NestJS', level: 'Expert', description: 'Enterprise Node.js framework' },
        { name: 'Node.js', level: 'Expert', description: 'JavaScript runtime' },
        { name: 'GraphQL', level: 'Expert', description: 'Modern API layer' },
        { name: 'REST APIs', level: 'Expert', description: 'RESTful services' },
      ],
    },
    {
      id: 'cloud',
      icon: Cloud,
      name: 'Cloud & DevOps',
      color: 'from-[#3B82F6] to-[#8B5CF6]',
      technologies: [
        { name: 'AWS Lambda', level: 'Expert', description: 'Serverless compute' },
        { name: 'AWS S3/CloudFront', level: 'Expert', description: 'Storage & CDN' },
        { name: 'Docker', level: 'Expert', description: 'Containerization' },
        { name: 'GitHub Actions', level: 'Expert', description: 'CI/CD automation' },
      ],
    },
    {
      id: 'ai',
      icon: Brain,
      name: 'AI & ML',
      color: 'from-[#06B6D4] to-[#8B5CF6]',
      technologies: [
        { name: 'OpenAI GPT-4', level: 'Expert', description: 'Advanced language models' },
        { name: 'Claude API', level: 'Expert', description: 'Anthropic AI integration' },
        { name: 'LangChain', level: 'Expert', description: 'LLM orchestration' },
        { name: 'Vector DBs', level: 'Expert', description: 'Semantic search' },
      ],
    },
    {
      id: 'security',
      icon: Shield,
      name: 'Security & Compliance',
      color: 'from-[#3B82F6] to-[#06B6D4]',
      technologies: [
        { name: 'OAuth 2.0', level: 'Expert', description: 'Authorization framework' },
        { name: 'GDPR Compliance', level: 'Expert', description: 'Data protection' },
        { name: 'ISO 27001', level: 'Expert', description: 'Security standards' },
        { name: 'Encryption', level: 'Expert', description: 'End-to-end security' },
      ],
    },
  ] as const;

  const [activeCategory, setActiveCategory] = useState<(typeof techCategories)[number]['id']>(
    'frontend'
  );

  const active = techCategories.find((cat) => cat.id === activeCategory);

  return (
    <section className="py-24 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full mb-6">
            <span className="text-sm text-[#8B5CF6] font-semibold">MODERN STACK</span>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-linear-to-r from-[#F8FAFC] to-[#8B5CF6] bg-clip-text text-transparent font-bold">
            Production-Ready Technology
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light">
            Enterprise-grade tools and frameworks trusted by global industry leaders
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {techCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              type="button"
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                activeCategory === category.id
                  ? 'border-[#06B6D4] bg-[#06B6D4]/10'
                  : 'border-slate-700/50 bg-[#1E293B] hover:border-slate-600'
              }`}
            >
              <category.icon
                className={`w-6 h-6 mx-auto mb-2 ${
                  activeCategory === category.id ? 'text-[#06B6D4]' : 'text-slate-400'
                }`}
              />
              <div
                className={`text-sm font-semibold ${
                  activeCategory === category.id ? 'text-[#F8FAFC]' : 'text-slate-300'
                }`}
              >
                {category.name}
              </div>
            </button>
          ))}
        </div>

        {active && (
          <div className="p-8 bg-linear-to-br from-[#1E293B] to-[#0F172A] border border-slate-700/50 rounded-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`w-16 h-16 rounded-xl bg-linear-to-br ${active.color} flex items-center justify-center`}
              >
                <active.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-[#F8FAFC]">{active.name}</h3>
                <p className="text-slate-400">Production-tested expertise</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {active.technologies.map((tech, index) => (
                <div
                  key={index}
                  className="group p-6 bg-[#0F172A]/50 border border-slate-700/30 rounded-xl hover:border-[#06B6D4]/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-xl font-semibold text-[#F8FAFC]">{tech.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold bg-linear-to-r ${active.color} text-white`}
                    >
                      {tech.level}
                    </span>
                  </div>
                  <p className="text-slate-400">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
