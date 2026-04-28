import { Award, Map, Target, Users } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-24 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="inline-block px-4 py-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full mb-6">
              <span className="text-sm text-[#8B5CF6] font-semibold">ABOUT ELVORIA TECH</span>
            </div>
            <h2 className="text-4xl md:text-5xl mb-6 bg-linear-to-r from-[#F8FAFC] to-[#8B5CF6] bg-clip-text text-transparent font-bold">
              World-Class Engineering Meets Modern Innovation
            </h2>
            <div className="space-y-4 text-lg text-slate-300 leading-relaxed">
              <p>
                Elvoria Tech is a <strong className="text-[#06B6D4]">senior-only engineering firm</strong>{' '}
                specializing in AI-first, cloud-native platforms for global enterprises. We combine
                world-class engineering excellence with modern agile practices, serving mission-critical
                systems across 35+ countries.
              </p>
              <p>
                Our team consists exclusively of{' '}
                <strong className="text-[#06B6D4]">senior engineers with 15+ years</strong> of experience
                in scaling platforms to millions of users. We don&apos;t do junior developers or legacy
                technology.
              </p>
              <p>
                We believe in <strong className="text-[#06B6D4]">security and privacy by design</strong>:
                GDPR-compliant architecture, enterprise-grade security practices, and transparent
                development processes as our foundation.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-linear-to-br from-[#1E293B] to-[#0F172A] border border-[#06B6D4]/30 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Mission</h3>
                  <p className="text-slate-300">
                    To architect the digital backbone of global enterprise with AI-first, cloud-native
                    solutions that combine engineering excellence with modern agility.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-linear-to-br from-[#1E293B] to-[#0F172A] border border-[#8B5CF6]/30 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shrink-0">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Vision</h3>
                  <p className="text-slate-300">
                    To become the most trusted technology partner for enterprises worldwide seeking
                    secure, scalable, and innovative digital transformation.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-linear-to-br from-[#1E293B] to-[#0F172A] border border-[#3B82F6]/30 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Values</h3>
                  <ul className="text-slate-300 space-y-1">
                    <li>• Reliability &amp; Excellence above all</li>
                    <li>• Security &amp; GDPR compliance by design</li>
                    <li>• Senior-only expert teams</li>
                    <li>• Transparent, long-term partnerships</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-linear-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 border border-[#06B6D4]/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <Users className="w-8 h-8 text-[#06B6D4] mt-1 shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-[#F8FAFC] mb-4">What Sets Us Apart</h3>
              <div className="grid md:grid-cols-2 gap-4 text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-[#06B6D4] mt-1">✓</span>
                  <span>
                    <strong className="text-[#F8FAFC]">Senior-Only Teams:</strong> 15+ years avg.
                    experience, zero junior devs
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06B6D4] mt-1">✓</span>
                  <span>
                    <strong className="text-[#F8FAFC]">Global Expertise:</strong> Distributed senior
                    teams worldwide
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06B6D4] mt-1">✓</span>
                  <span>
                    <strong className="text-[#F8FAFC]">AI-First Architecture:</strong> GPT-4, Claude,
                    LangChain integrated by default
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06B6D4] mt-1">✓</span>
                  <span>
                    <strong className="text-[#F8FAFC]">Mission-Critical Focus:</strong> Aviation,
                    restaurant tech, e-commerce
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06B6D4] mt-1">✓</span>
                  <span>
                    <strong className="text-[#F8FAFC]">Cloud-Native by Default:</strong> AWS Lambda,
                    serverless, auto-scaling
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06B6D4] mt-1">✓</span>
                  <span>
                    <strong className="text-[#F8FAFC]">Reliability First:</strong> 99.99% uptime,
                    enterprise-grade security
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
