import { Award, Check, Map, MapPin, Target, Users } from 'lucide-react';
import Image from 'next/image';

const COMPANY_BRANCH = {
  name: 'Elvoria Technologies',
  office: 'Koblenz, Germany',
  tagline: 'Engineering-led · AI-first · Cloud-native',
} as const;

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
              Engineering AI-First Cloud Platforms for Modern Businesses
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Elvoria Technologies is an engineering-led software development team focused on building AI-first,
                cloud-native applications for startups and growing businesses.
              </p>
              <p>
                We design and develop scalable platforms, SaaS products, and backend systems using modern
                engineering practices and cloud infrastructure.
              </p>
              <p>
                Our work spans distributed systems, API-driven architectures, and automation-focused
                applications built for reliability and performance.
              </p>
              <p>
                We follow security-first and privacy-conscious development practices, aligning with GDPR
                standards and enterprise security requirements where applicable.
              </p>
            </div>
          </div>

          <div className="flex h-64 flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 sm:h-80 sm:p-8 lg:h-96 dark:border-[#06B6D4]/25 dark:bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A]">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#06B6D4]/30 bg-[#0F172A] shadow-lg shadow-[#06B6D4]/10 sm:h-20 sm:w-20">
                <Image
                  src="/elvoria.png"
                  alt={`${COMPANY_BRANCH.name} logo`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                  {COMPANY_BRANCH.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">{COMPANY_BRANCH.tagline}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/80 p-4 dark:border-slate-700/80 dark:bg-[#0F172A]/60">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#06B6D4]">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                Branch office
              </div>
              <p className="text-lg font-semibold text-foreground dark:text-[#F8FAFC]">{COMPANY_BRANCH.office}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground dark:text-slate-400">
                Remote-first delivery for clients across 35+ countries, with our engineering hub in Germany.
              </p>
            </div>

            <p className="text-sm text-muted-foreground dark:text-slate-500">
              Experienced engineering teams · GDPR-aware practices · Long-term partnerships
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
                  <h3 className="mb-2 text-xl font-bold text-foreground">Mission</h3>
                  <p className="text-muted-foreground dark:text-slate-300">
                    To design and build secure, scalable AI-first and cloud-native systems that help businesses
                    modernize their digital infrastructure.
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
                  <h3 className="mb-2 text-xl font-bold text-foreground">Vision</h3>
                  <p className="text-muted-foreground dark:text-slate-300">
                    To be a long-term engineering partner for companies building reliable, high-performance
                    software systems in the cloud and AI era.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-6 dark:bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border-[#3B82F6]/30">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#3B82F6] to-[#8B5CF6]">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-3 text-xl font-bold text-foreground">Values</h3>
                  <ul className="list-none space-y-1.5 text-sm leading-snug text-muted-foreground sm:text-base dark:text-slate-300">
                    <li className="flex gap-2.5">
                      <span className="shrink-0 font-semibold text-[#06B6D4]" aria-hidden>
                        •
                      </span>
                      <span>Reliability &amp; Excellence above all</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="shrink-0 font-semibold text-[#8B5CF6]" aria-hidden>
                        •
                      </span>
                      <span>Security &amp; GDPR compliance by design</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="shrink-0 font-semibold text-[#3B82F6]" aria-hidden>
                        •
                      </span>
                      <span>Experienced expert teams</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="shrink-0 font-semibold text-[#06B6D4]" aria-hidden>
                        •
                      </span>
                      <span>Transparent, long-term partnerships</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-linear-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 p-4 sm:mt-12 sm:p-6 md:mt-14 md:p-8 dark:border-[#06B6D4]/30">
          <div className="flex items-start gap-3 sm:gap-4">
            <Users className="mt-1 h-7 w-7 shrink-0 text-[#06B6D4] sm:h-8 sm:w-8" />
            <div className="min-w-0">
              <h3 className="mb-3 text-xl font-bold text-foreground sm:mb-4 sm:text-2xl">What Sets Us Apart</h3>
              <div className="grid gap-4 text-muted-foreground md:grid-cols-2 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Engineering-led:</strong> AI-first,
                    cloud-native applications for startups and growing businesses
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Platforms &amp; SaaS:</strong> Scalable
                    products and backend systems on modern cloud infrastructure
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Distributed systems &amp; APIs:</strong>{' '}
                    Automation-focused apps built for reliability and performance
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" strokeWidth={2.5} aria-hidden />
                  <span>
                    <strong className="text-foreground dark:text-[#F8FAFC]">Security &amp; privacy:</strong> GDPR-aware
                    practices and enterprise expectations where your project needs them
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
