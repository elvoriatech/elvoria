import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO",
    company: "TechFlow Solutions",
    image: "https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    text: "Elvoriatech transformed our legacy system into a modern, scalable SaaS platform. The AI automation they built saved us over €400K annually in operational costs. Their team's expertise in cloud architecture and AI integration is unmatched.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "CTO",
    company: "FinanceHub",
    image: "https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    text: "We've worked with 5+ development agencies over the years. Elvoriatech is the first one that truly understands modern architecture. They delivered a microservices platform that handles 10M+ requests daily with 99.99% uptime. Exceptional work.",
    rating: 5
  },
  {
    name: "Jennifer Park",
    role: "VP of Product",
    company: "MediConnect",
    image: "https://images.unsplash.com/photo-1758873268631-fa944fc5cad2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    text: "What impressed us most was their business-first approach. They didn't just build what we asked for—they challenged our assumptions and proposed solutions that actually moved our key metrics. Our conversion rate increased 42% after launch.",
    rating: 5
  },
  {
    name: "David Thompson",
    role: "Founder",
    company: "RetailX",
    image: "https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    text: "The team's expertise in performance optimization is incredible. They reduced our page load times from 4.2s to 0.8s, which directly translated to a 28% increase in mobile revenue. Best investment we've made in our tech stack.",
    rating: 5
  },
  {
    name: "Amanda Williams",
    role: "Head of Engineering",
    company: "CloudSync",
    image: "https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    text: "Communication and transparency were outstanding. Daily updates, shared Slack channel, and access to all project management tools. We always knew exactly where we stood. The code quality and documentation exceeded our expectations.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-6 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-transparent">
            Client Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our clients say about
            working with Elvoriatech.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border/60 bg-card/90 hover:bg-card transition-all dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 dark:border-white/10"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              <Quote className="w-8 h-8 text-(--brand-primary)/40 mb-4" />

              <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>

              <div className="flex items-center gap-4 pt-4 border-t border-border/60 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-foreground/5 border border-border/60 dark:bg-purple-600/20 dark:border-white/10">
                  <div className="w-full h-full flex items-center justify-center text-foreground/70 dark:text-purple-200">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div>
                  <div className="text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-2xl border border-border/60 bg-card/80 text-center dark:bg-linear-to-r dark:from-purple-900/20 dark:to-blue-900/20 dark:border-white/10">
          <h3 className="text-2xl mb-4 text-foreground">Join 150+ Successful Companies</h3>
          <p className="text-lg text-muted-foreground mb-6">
            From startups to Fortune 500 companies, we've helped businesses across industries
            scale their technology and achieve their goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-2 bg-foreground/5 border border-border/60 rounded-lg text-muted-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
              SaaS Startups
            </div>
            <div className="px-6 py-2 bg-foreground/5 border border-border/60 rounded-lg text-muted-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
              E-Commerce
            </div>
            <div className="px-6 py-2 bg-foreground/5 border border-border/60 rounded-lg text-muted-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
              FinTech
            </div>
            <div className="px-6 py-2 bg-foreground/5 border border-border/60 rounded-lg text-muted-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
              HealthTech
            </div>
            <div className="px-6 py-2 bg-foreground/5 border border-border/60 rounded-lg text-muted-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
              EdTech
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
