import { Github, Linkedin, Mail, Shield } from 'lucide-react';
import Image from 'next/image';

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
              <a
                href="#"
                className="w-10 h-10 bg-card border border-border/60 rounded-lg flex items-center justify-center hover:border-[#06B6D4] hover:bg-muted/30 transition-all dark:bg-[#1E293B] dark:border-slate-700 dark:hover:bg-[#1E293B]/80"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-[#06B6D4] dark:text-slate-400" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-card border border-border/60 rounded-lg flex items-center justify-center hover:border-[#06B6D4] hover:bg-muted/30 transition-all dark:bg-[#1E293B] dark:border-slate-700 dark:hover:bg-[#1E293B]/80"
              >
                <Github className="w-5 h-5 text-muted-foreground hover:text-[#06B6D4] dark:text-slate-400" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-card border border-border/60 rounded-lg flex items-center justify-center hover:border-[#06B6D4] hover:bg-muted/30 transition-all dark:bg-[#1E293B] dark:border-slate-700 dark:hover:bg-[#1E293B]/80"
              >
                <Mail className="w-5 h-5 text-muted-foreground hover:text-[#06B6D4] dark:text-slate-400" />
              </a>
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
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm font-semibold text-foreground dark:text-[#F8FAFC]">Global Experienced Teams</span>
            </div>
            <div className="hidden h-6 w-px bg-border/60 sm:block dark:bg-slate-700" aria-hidden />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm font-semibold text-foreground dark:text-[#F8FAFC]">GDPR Compliant</span>
            </div>
            <div className="hidden h-6 w-px bg-border/60 sm:block dark:bg-slate-700" aria-hidden />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm font-semibold text-foreground dark:text-[#F8FAFC]">Enterprise Security</span>
            </div>
            <div className="hidden h-6 w-px bg-border/60 sm:block dark:bg-slate-700" aria-hidden />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm font-semibold text-foreground dark:text-[#F8FAFC]">World-Class Quality</span>
            </div>
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
