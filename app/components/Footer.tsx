import { Github, Linkedin, Mail } from 'lucide-react';
import { TRUST_PILLARS } from '@/lib/trustPillars';
import { ScheduleConsultationTrigger } from './ScheduleConsultationTrigger';
import { TrustPillarIconBox } from './TrustPillarIconBox';
import Image from 'next/image';

const socialIconClass =
  'flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-card transition-all dark:border-slate-700 dark:bg-[#1E293B]';
const socialIconDisabledClass = `${socialIconClass} cursor-not-allowed opacity-40`;
const socialIconActiveClass = `${socialIconClass} hover:border-[#06B6D4] hover:bg-muted/30 dark:hover:bg-[#1E293B]/80`;

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/60 dark:bg-linear-to-b dark:from-[#0F172A] dark:to-black dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-10 py-10 sm:mb-12 sm:gap-12 sm:py-14 md:grid-cols-4 md:py-16">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/elvoria.png"
                alt="Elvoria Tech"
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
              <h3 className="bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                Elvoria Tech
              </h3>
            </div>
            <p className="text-muted-foreground dark:text-slate-400 mb-6 max-w-md leading-relaxed">
              Architecting the future of global enterprise with AI-first, cloud-native solutions.
              Experienced engineering teams delivering mission-critical systems across 35+ countries worldwide.
            </p>
            <div className="flex items-center gap-4">
              <span
                className={socialIconDisabledClass}
                aria-hidden="true"
                title="LinkedIn — coming soon"
              >
                <Linkedin className="h-5 w-5 text-muted-foreground dark:text-slate-500" />
              </span>
              <span
                className={socialIconDisabledClass}
                aria-hidden="true"
                title="GitHub — coming soon"
              >
                <Github className="h-5 w-5 text-muted-foreground dark:text-slate-500" />
              </span>
              <ScheduleConsultationTrigger
                className={socialIconActiveClass}
                aria-label="Schedule a consultation"
              >
                <Mail className="h-5 w-5 text-muted-foreground hover:text-[#06B6D4] dark:text-slate-400" />
              </ScheduleConsultationTrigger>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-base font-bold text-foreground sm:mb-4 sm:text-lg dark:text-[#F8FAFC]">Services</h4>
            <ul className="space-y-2 text-muted-foreground dark:text-slate-400">
              <li>
                <a href="#services" className="hover:text-[#06B6D4] transition-colors">
                  AI-First SaaS
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#06B6D4] transition-colors">
                  Cloud Architecture
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#06B6D4] transition-colors">
                  Marketplace Platforms
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#06B6D4] transition-colors">
                  Mission-Critical Systems
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#06B6D4] transition-colors">
                  DevOps &amp; Automation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-base font-bold text-foreground sm:mb-4 sm:text-lg dark:text-[#F8FAFC]">Company</h4>
            <ul className="space-y-2 text-muted-foreground dark:text-slate-400">
              <li>
                <a href="#about" className="hover:text-[#06B6D4] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-[#06B6D4] transition-colors">
                  Case Studies
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#06B6D4] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-border/60 bg-linear-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 p-4 sm:mb-8 sm:p-6 dark:border-[#06B6D4]/30">
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {TRUST_PILLARS.map((item, index) => (
              <div key={item.title} className="flex gap-2.5">
                <TrustPillarIconBox iconId={item.icon} index={index} size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground sm:text-sm dark:text-[#F8FAFC]">{item.title}</div>
                  <p className="mt-1 text-[10px] leading-snug text-muted-foreground sm:text-[11px] dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-border/60 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 pb-10">
          <div className="text-muted-foreground dark:text-slate-400 text-sm">© 2026 Elvoria Tech. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground dark:text-slate-400">
            <a href="#" className="hover:text-[#06B6D4] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#06B6D4] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#06B6D4] transition-colors">
              GDPR Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
