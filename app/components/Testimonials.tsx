import { Quote, Star, User } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO',
    company: 'TechFlow Solutions',
    text: "Elvoriatech transformed our legacy system into a modern, scalable SaaS platform. The AI automation they built saved us over €400K annually in operational costs. Their team's expertise in cloud architecture and AI integration is unmatched.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Michael Rodriguez',
    role: 'CTO',
    company: 'FinanceHub',
    text: "We've worked with 5+ development agencies over the years. Elvoriatech is the first one that truly understands modern architecture. They delivered a microservices platform that handles 10M+ requests daily with 99.99% uptime. Exceptional work.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Jennifer Park',
    role: 'VP of Product',
    company: 'MediConnect',
    text: "What impressed us most was their business-first approach. They didn't just build what we asked for—they challenged our assumptions and proposed solutions that actually moved our key metrics. Our conversion rate increased 42% after launch.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'David Thompson',
    role: 'Founder',
    company: 'RetailX',
    text: "The team's expertise in performance optimization is incredible. They reduced our page load times from 4.2s to 0.8s, which directly translated to a 28% increase in mobile revenue. Best investment we've made in our tech stack.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Amanda Williams',
    role: 'Head of Engineering',
    company: 'CloudSync',
    text: 'Communication and transparency were outstanding. Daily updates, shared Slack channel, and access to all project management tools. We always knew exactly where we stood. The code quality and documentation exceeded our expectations.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-16 sm:py-20 md:py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-5 bg-linear-to-r from-(--brand-primary) to-(--brand-accent) bg-clip-text text-3xl text-transparent sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Client Success Stories
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Don&apos;t just take our word for it. Here&apos;s what our clients say about
            working with Elvoriatech.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/60 bg-card/90 p-4 transition-all hover:bg-card sm:p-6 dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 dark:border-white/10"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" aria-hidden />
                ))}
              </div>

              <Quote className="w-8 h-8 text-(--brand-primary)/40 mb-4" aria-hidden />

              <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.text}&quot;</p>

              <div className="flex items-center gap-4 pt-4 border-t border-border/60 dark:border-slate-700">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-border/60 dark:border-white/10">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{testimonial.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-2xl border border-border/60 bg-card/80 text-center dark:bg-linear-to-r dark:from-purple-900/20 dark:to-blue-900/20 dark:border-white/10">
          <h3 className="text-2xl mb-4 text-foreground">Join 150+ Successful Companies</h3>
          <p className="text-lg text-muted-foreground mb-6">
            From startups to Fortune 500 companies, we&apos;ve helped businesses across industries
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
