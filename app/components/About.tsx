import { Target, Eye, Heart, Award } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-6 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            About Elvoriatech
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A premium software development company specializing in AI-powered solutions,
            cloud-native applications, and scalable SaaS platforms for the modern enterprise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl text-purple-300">Who We Are</h3>
            <p className="text-lg text-slate-300">
              Elvoriatech is a forward-thinking software development company founded by industry veterans
              with over 15 years of combined experience in building enterprise-grade applications. We're
              not just developers—we're strategic partners who understand that technology is a means to
              achieve business goals, not an end in itself.
            </p>
            <p className="text-lg text-slate-300">
              In today's rapidly evolving digital landscape, businesses need more than just code. They
              need intelligent, scalable solutions that adapt to market changes, leverage cutting-edge
              AI capabilities, and deliver measurable ROI. That's exactly what we deliver.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Our team"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-purple-900/50 to-transparent"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-linear-to-br from-slate-900 to-slate-800 border border-purple-500/20 rounded-2xl">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-2xl mb-4 text-purple-300">Our Mission</h4>
            <p className="text-slate-300">
              To empower businesses with cutting-edge technology solutions that drive innovation,
              efficiency, and sustainable growth in an AI-first world.
            </p>
          </div>

          <div className="p-8 bg-linear-to-br from-slate-900 to-slate-800 border border-blue-500/20 rounded-2xl">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-2xl mb-4 text-blue-300">Our Vision</h4>
            <p className="text-slate-300">
              To be the most trusted technology partner for ambitious companies looking to leverage
              AI, cloud computing, and modern software architecture to dominate their markets.
            </p>
          </div>

          <div className="p-8 bg-linear-to-br from-slate-900 to-slate-800 border border-purple-500/20 rounded-2xl">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-2xl mb-4 text-purple-300">Core Values</h4>
            <ul className="text-slate-300 space-y-2">
              <li>• Innovation-first mindset</li>
              <li>• Transparent communication</li>
              <li>• Results-driven approach</li>
              <li>• Long-term partnerships</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 p-8 bg-linear-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-purple-400 mt-1 shrink-0" />
            <div>
              <h4 className="text-2xl mb-4 text-purple-300">What Makes Us Different</h4>
              <p className="text-lg text-slate-300 mb-4">
                While many agencies still build with outdated tech stacks and waterfall methodologies,
                we're obsessed with modern architecture:
              </p>
              <ul className="grid md:grid-cols-2 gap-3 text-slate-300">
                <li>✓ AI-first development approach</li>
                <li>✓ Cloud-native architecture by default</li>
                <li>✓ Modern tech stack (React, Next.js, Node.js)</li>
                <li>✓ Microservices & serverless expertise</li>
                <li>✓ DevOps & CI/CD from day one</li>
                <li>✓ Performance & scalability obsessed</li>
                <li>✓ Real-time collaboration & Agile process</li>
                <li>✓ Business outcomes, not just features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
