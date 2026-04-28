import { Github, Linkedin, Mail, Shield } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-linear-to-b from-[#0F172A] to-black border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12 py-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/elvoria.png"
                alt="Elvoria Tech"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <h3 className="text-2xl bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-transparent font-bold">
                Elvoria Tech
              </h3>
            </div>
            <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
              Architecting the future of global enterprise with AI-first, cloud-native solutions.
              Senior-only teams delivering mission-critical systems across 35+ countries worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-[#1E293B] border border-slate-700 rounded-lg flex items-center justify-center hover:border-[#06B6D4] hover:bg-[#1E293B]/80 transition-all"
              >
                <Linkedin className="w-5 h-5 text-slate-400 hover:text-[#06B6D4]" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[#1E293B] border border-slate-700 rounded-lg flex items-center justify-center hover:border-[#06B6D4] hover:bg-[#1E293B]/80 transition-all"
              >
                <Github className="w-5 h-5 text-slate-400 hover:text-[#06B6D4]" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[#1E293B] border border-slate-700 rounded-lg flex items-center justify-center hover:border-[#06B6D4] hover:bg-[#1E293B]/80 transition-all"
              >
                <Mail className="w-5 h-5 text-slate-400 hover:text-[#06B6D4]" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-[#F8FAFC]">Services</h4>
            <ul className="space-y-2 text-slate-400">
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
            <h4 className="text-lg font-bold mb-4 text-[#F8FAFC]">Company</h4>
            <ul className="space-y-2 text-slate-400">
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

        <div className="mb-8 p-6 bg-linear-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 border border-[#06B6D4]/30 rounded-xl">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm font-semibold text-[#F8FAFC]">Global Senior Teams</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm font-semibold text-[#F8FAFC]">GDPR Compliant</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm font-semibold text-[#F8FAFC]">Enterprise Security</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm font-semibold text-[#F8FAFC]">World-Class Quality</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 pb-10">
          <div className="text-slate-400 text-sm">© 2026 Elvoria Tech. All rights reserved.</div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
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
