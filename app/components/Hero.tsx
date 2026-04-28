/* eslint-disable @next/next/no-img-element */
'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

export function Hero() {
  const slides = useMemo(
    () => [
      {
        eyebrow: 'AI-First Development Partner',
        title: 'Elvoriatech',
        subtitle: 'Transforming Ideas into Scalable, AI‑Powered Digital Solutions',
        body:
          'Premium software development for startups and enterprises. We build SaaS platforms, AI solutions, and cloud-native applications that drive real business growth.',
        image:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=80',
      },
      {
        eyebrow: 'Product Engineering',
        title: 'Ship Faster',
        subtitle: 'Design, build, and scale products your users love',
        body:
          'From discovery to delivery, we move with senior velocity—clean architecture, delightful UX, and measurable outcomes.',
        image:
          'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=2400&q=80',
      },
      {
        eyebrow: 'Cloud & Platforms',
        title: 'Scale Reliably',
        subtitle: 'Cloud-native systems built for performance and security',
        body:
          'We help you modernize infrastructure, strengthen security, and optimize cost with best-practice DevOps and platform engineering.',
        image:
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2400&q=80',
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotionRef = useRef(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = media.matches;
    const onChange = () => {
      reducedMotionRef.current = media.matches;
    };
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (reducedMotionRef.current) return;
    const id = window.setInterval(() => {
      setActive((v) => (v + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  function go(delta: number) {
    setActive((v) => (v + delta + slides.length) % slides.length);
  }

  function scrollToId(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const slide = slides[active];

  return (
    <section
      id="top"
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-background mesh-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const startX = touchStartX.current;
        const endX = e.changedTouches[0]?.clientX ?? null;
        touchStartX.current = null;
        setPaused(false);
        if (startX == null || endX == null) return;
        const dx = endX - startX;
        if (Math.abs(dx) < 50) return;
        go(dx < 0 ? 1 : -1);
      }}
      aria-roledescription="carousel"
      aria-label="Hero highlights"
    >
      {/* Background image + brand mesh */}
      <div className="absolute inset-0 opacity-20">
        <img src={slide.image} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent"></div>
      <div className="absolute inset-0 geo-overlay pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-border/60 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-(--brand-accent)" />
          <span className="text-sm text-foreground/80">{slide.eyebrow}</span>
        </div>

        <h1 className="mb-6">
          {active === 0 ? (
            <div className="flex flex-col items-center gap-4">
              <span className="sr-only">Elvoriatech</span>
              <Image
                src="/elvoria.png"
                alt=""
                width={96}
                height={96}
                priority
                className="h-20 w-20 sm:h-24 sm:w-24"
              />
            </div>
          ) : (
            <span className="block text-5xl sm:text-6xl md:text-8xl bg-linear-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              {slide.title}
            </span>
          )}
        </h1>

        <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 mb-8 max-w-4xl mx-auto">
          {slide.subtitle}
        </p>

        <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
          {slide.body}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            className="group px-8 py-4 bg-linear-to-r from-(--brand-accent) to-(--brand-primary) rounded-lg hover:shadow-lg hover:shadow-(color:--brand-primary)/35 transition-all duration-300 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60"
            onClick={() => scrollToId('contact')}
            type="button"
          >
            <span className="text-lg">Start Your Project</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            className="px-8 py-4 bg-foreground/5 border border-border/60 rounded-lg hover:bg-foreground/10 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60"
            onClick={() => scrollToId('portfolio')}
            type="button"
          >
            <span className="text-lg">View Our Work</span>
          </button>
        </div>

        {/* Carousel controls */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60"
            onClick={() => go(-1)}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={[
                  'h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60',
                  i === active ? 'w-8 bg-foreground/90' : 'w-2.5 bg-foreground/30 hover:bg-foreground/45',
                ].join(' ')}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
                onClick={() => setActive(i)}
              />
            ))}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60"
            onClick={() => go(1)}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto">
          <div>
            <div className="text-4xl mb-2 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">150+</div>
            <div className="text-slate-400">Projects Delivered</div>
          </div>
          <div>
            <div className="text-4xl mb-2 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">98%</div>
            <div className="text-slate-400">Client Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl mb-2 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">50+</div>
            <div className="text-slate-400">Expert Developers</div>
          </div>
          <div>
            <div className="text-4xl mb-2 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">24/7</div>
            <div className="text-slate-400">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}
