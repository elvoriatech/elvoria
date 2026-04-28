import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-16 bg-linear-to-b from-slate-900 to-black border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <h3 className="text-3xl mb-4 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Elvoriatech
            </h3>
            <p className="text-slate-400 mb-6 max-w-md">
              Transforming ideas into scalable, AI-powered digital solutions.
              Premium software development for startups and enterprises.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-slate-700 transition-all">
                <Twitter className="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-slate-700 transition-all">
                <Linkedin className="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-slate-700 transition-all">
                <Github className="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-slate-700 transition-all">
                <Mail className="w-5 h-5 text-slate-400" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg mb-4 text-purple-300">Services</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">AI Solutions</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">SaaS Development</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Web Development</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Mobile Apps</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Cloud & DevOps</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg mb-4 text-purple-300">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Portfolio</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            © 2026 Elvoriatech. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
