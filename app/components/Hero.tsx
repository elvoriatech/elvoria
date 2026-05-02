/* eslint-disable @next/next/no-img-element */
'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

type HeroSlide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  primaryCta: { label: string; targetId: string };
  secondaryCta: { label: string; targetId: string };
};

export function Hero() {
  const slides = useMemo<HeroSlide[]>(
    () => [
      {
        eyebrow: 'AI-first engineering · clear delivery',
        title: 'AI-First Software Engineering for Scalable Digital Products',
        subtitle:
          'We design and build cloud-native SaaS platforms, marketplaces, and automation systems using modern AI and full-stack technologies.',
        body: '',
        primaryCta: { label: 'Start Your Project', targetId: 'contact' },
        secondaryCta: { label: 'View Our Work', targetId: 'portfolio' },
        image:
          'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=2400&q=80',
      },
      {
        eyebrow: 'For startups & growing businesses',
        title: 'Build Faster. Scale Smarter. Ship AI-Driven Products.',
        subtitle:
          'From idea to production, we help startups and businesses launch high-performance applications powered by modern cloud and AI technologies.',
        body: '',
        primaryCta: { label: 'Get a Free Consultation', targetId: 'contact' },
        secondaryCta: { label: 'See Case Studies', targetId: 'portfolio' },
        image:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=80',
      },
      {
        eyebrow: 'Premium partnerships · long-term thinking',
        title: 'Engineering Intelligent Systems for the Next Generation of Businesses',
        subtitle:
          'We partner with forward-thinking teams to build AI-powered platforms, scalable architectures, and mission-critical digital experiences.',
        body: '',
        primaryCta: { label: "Let's Build Together", targetId: 'contact' },
        secondaryCta: { label: 'Explore Our Work', targetId: 'portfolio' },
        image:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2400&q=80',
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
      className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-slate-50 dark:bg-linear-to-br dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A]"
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
      {/* Grid Pattern Overlay — slightly stronger in light theme for definition */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(6 182 212 / 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgb(6 182 212 / 0.45) 1px, transparent 1px)',
            backgroundSize: 'min(12vw, 80px) min(12vw, 80px)',
          }}
        />
      </div>

      {/* Gradient Orbs — normal blend in light so text stays readable */}
      <div className="absolute top-1/4 right-1/4 h-48 w-48 rounded-full bg-violet-300/50 mix-blend-normal opacity-40 blur-[72px] filter animate-pulse sm:h-72 sm:w-72 sm:blur-[96px] md:h-96 md:w-96 md:blur-[128px] dark:bg-[#8B5CF6] dark:mix-blend-multiply dark:opacity-20" />
      <div
        className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-cyan-300/45 mix-blend-normal opacity-40 blur-[72px] filter animate-pulse sm:h-72 sm:w-72 sm:blur-[96px] md:h-96 md:w-96 md:blur-[128px] dark:bg-[#06B6D4] dark:mix-blend-multiply dark:opacity-20"
        style={{ animationDelay: '1s' }}
      />

      {/* Background image — higher presence in light + readable scrim */}
      <div className="absolute inset-0 opacity-35 saturate-[0.95] dark:opacity-20 dark:saturate-100">
        <img src={slide.image} alt="" className="h-full w-full object-cover object-center" />
      </div>

      {/* Scrim: strong light wash for readable type; dark keeps cinematic bottom weight */}
      <div className="absolute inset-0 bg-linear-to-b from-white/90 via-white/55 to-slate-100 dark:from-[#0F172A]/90 dark:via-[#0F172A]/50 dark:to-[#0F172A]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 md:px-8 md:py-20 lg:py-24">
        <div className="mb-5 inline-flex max-w-[95vw] items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3 py-1.5 backdrop-blur-sm sm:mb-8 sm:px-4 sm:py-2">
          <Sparkles className="h-4 w-4 shrink-0 text-[#06B6D4]" />
          <span className="text-left text-xs font-semibold text-[#06B6D4] sm:text-sm">{slide.eyebrow}</span>
        </div>

        <h1 className="mb-5 flex flex-col items-center font-bold tracking-tight sm:mb-6">
          <div className="flex max-w-full flex-col items-center gap-3 sm:gap-4">
            <span className="sr-only">Elvoriatech</span>
            <Image
              src="/elvoria.png"
              alt=""
              width={96}
              height={96}
              priority
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24"
            />
            <span className="block max-w-full whitespace-pre-line bg-linear-to-r from-slate-900 via-[#0e7490] to-[#5b21b6] bg-clip-text px-1 text-2xl leading-[1.12] text-transparent sm:px-0 sm:text-4xl sm:leading-[1.08] md:text-5xl lg:text-6xl xl:text-7xl dark:from-[#F8FAFC] dark:via-[#06B6D4] dark:to-[#8B5CF6]">
              {slide.title}
            </span>
          </div>
        </h1>

        <p className="mx-auto mb-6 max-w-4xl text-base font-light text-slate-600 sm:mb-8 sm:text-lg md:text-xl lg:text-2xl dark:text-slate-300">
          {slide.subtitle}
        </p>

        {slide.body ? (
          <p className="mx-auto mb-8 max-w-3xl text-sm text-slate-500 sm:mb-10 sm:text-base md:mb-12 md:text-lg dark:text-slate-400">
            {slide.body}
          </p>
        ) : null}

        <div className="flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
          <button
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-(--brand-accent) to-(--brand-primary) px-5 py-3 text-base transition-all duration-300 hover:shadow-lg hover:shadow-(color:--brand-primary)/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            onClick={() => scrollToId(slide.primaryCta.targetId)}
            type="button"
          >
            <span>{slide.primaryCta.label}</span>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            className="w-full rounded-lg border border-border/60 bg-foreground/5 px-5 py-3 text-base transition-all duration-300 hover:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            onClick={() => scrollToId(slide.secondaryCta.targetId)}
            type="button"
          >
            {slide.secondaryCta.label}
          </button>
        </div>

        {/* Carousel controls */}
        <div className="mt-8 flex items-center justify-center gap-3 sm:mt-10">
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
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:mt-16 sm:gap-6 md:mt-20 md:grid-cols-4 md:gap-8 lg:mt-24">
          <div>
            <div className="mb-1 bg-linear-to-r from-[#7c3aed] to-[#0891b2] bg-clip-text text-2xl font-bold text-transparent sm:mb-2 sm:text-3xl md:text-4xl dark:from-purple-400 dark:to-blue-400">
              150+
            </div>
            <div className="text-xs text-slate-600 sm:text-sm dark:text-muted-foreground">Projects Delivered</div>
          </div>
          <div>
            <div className="mb-1 bg-linear-to-r from-[#7c3aed] to-[#0891b2] bg-clip-text text-2xl font-bold text-transparent sm:mb-2 sm:text-3xl md:text-4xl dark:from-purple-400 dark:to-blue-400">
              98%
            </div>
            <div className="text-xs text-slate-600 sm:text-sm dark:text-muted-foreground">Client Satisfaction</div>
          </div>
          <div>
            <div className="mb-1 bg-linear-to-r from-[#7c3aed] to-[#0891b2] bg-clip-text text-2xl font-bold text-transparent sm:mb-2 sm:text-3xl md:text-4xl dark:from-purple-400 dark:to-blue-400">
              50+
            </div>
            <div className="text-xs text-slate-600 sm:text-sm dark:text-muted-foreground">Expert Developers</div>
          </div>
          <div>
            <div className="mb-1 bg-linear-to-r from-[#7c3aed] to-[#0891b2] bg-clip-text text-2xl font-bold text-transparent sm:mb-2 sm:text-3xl md:text-4xl dark:from-purple-400 dark:to-blue-400">
              24/7
            </div>
            <div className="text-xs text-slate-600 sm:text-sm dark:text-muted-foreground">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}
