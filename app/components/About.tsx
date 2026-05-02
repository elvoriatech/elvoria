import { Award, Check, Map, Target, Users } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="bg-background py-16 sm:py-20 md:py-24 dark:bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-10 lg:mb-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="inline-block px-4 py-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full mb-6">
              <span className="text-sm text-[#8B5CF6] font-semibold">ABOUT ELVORIA TECH</span>
            </div>
            <h2 className="mb-5 bg-linear-to-r from-foreground to-[#8B5CF6] bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-4xl md:text-5xl">
              World-Class Engineering Meets Modern Innovation
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Elvoria Tech is an <strong className="text-[#06B6D4]">experienced-engineer-led firm</strong>{' '}
                specializing in AI-first, cloud-native platforms for global enterprises. We combine
                world-class engineering excellence with modern agile practices, serving mission-critical
                systems across 35+ countries.
              </p>
              <p>
                Our team consists exclusively of{' '}
                <strong className="text-[#06B6D4]">experienced engineers with 15+ years</strong> of experience
                in scaling platforms to millions of users. We avoid legacy-only stacks and prioritize depth
                over rotating junior benches.
              </p>
              <p>
                We believe in <strong className="text-[#06B6D4]">security and privacy by design</strong>:
                GDPR-compliant architecture, enterprise-grade security practices, and transparent
                development processes as our foundation.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-6 dark:bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border-[#06B6D4]/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Mission</h3>
                  <p className="text-muted-foreground dark:text-slate-300">
                    To architect the digital backbone of global enterprise with AI-first, cloud-native
                    solutions that combine engineering excellence with modern agility.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-6 dark:bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border-[#8B5CF6]/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shrink-0">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Vision</h3>
                  <p className="text-muted-foreground dark:text-slate-300">
                    To become the most trusted technology partner for enterprises worldwide seeking
                    secure, scalable, and innovative digital transformation.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-6 dark:bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border-[#3B82F6]/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Values</h3>
                  <ul className="text-muted-foreground dark:text-slate-300 space-y-1">
                    <li>• Reliability &amp; Excellence above all</li>
                    <li>• Security &amp; GDPR compliance by design</li>
                    <li>• Experienced expert teams</li>
                    <li>• Transparent, long-term partnerships</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-linear-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 p-4 sm:p-6 md:p-8 dark:border-[#06B6D4]/30">
          <div className="flex items-start gap-3 sm:gap-4">
            <Users className="mt-1 h-7 w-7 shrink-0 text-[#06B6D4] sm:h-8 sm:w-8" />
            <div className="min-w-0">
              <h3 className="mb-3 text-xl font-bold text-foreground sm:mb-4 sm:text-2xl">What Sets Us Apart</h3>
              <div className="grid md:grid-cols-2 gap-4 text-muted-foreground dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Experienced engineers:</strong> 15+ years avg.
                    experience; depth over churn
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Global Expertise:</strong> Experienced engineers,
                    distributed worldwide
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">AI-First Architecture:</strong> GPT-4, Claude,
                    LangChain integrated by default
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Mission-Critical Focus:</strong> Aviation,
                    restaurant tech, e-commerce
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Cloud-Native by Default:</strong> AWS Lambda,
                    serverless, auto-scaling
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Reliability First:</strong> 99.99% uptime,
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
