'use client';

import { ArrowRight, Briefcase, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';
import type { ContactInquiryPreset } from '@/lib/elvoriaEvents';
import { ContactInquiryTrigger } from './ContactInquiryTrigger';
import { ScheduleConsultationTrigger } from './ScheduleConsultationTrigger';

type EngagementCard = {
  name: string;
  description: string;
  bestFor: string[];
  features: { text: string; included: boolean }[];
  idealLine: string;
  cta: string;
  contactPreset: ContactInquiryPreset;
  badge?: string;
};

const DEFAULT_SELECTED_INDEX = 0;

export function EngagementModels() {
  const models: EngagementCard[] = [
    {
      name: 'Dedicated Product Team',
      description: 'Build and scale your product with an experienced engineering team',
      bestFor: ['SaaS product development', 'Long-term scaling', 'Continuous feature delivery'],
      features: [
        { text: 'Experienced engineers only', included: true },
        { text: 'Full-time dedicated team', included: true },
        { text: 'Agile sprint-based delivery', included: true },
        { text: 'Direct Slack communication', included: true },
        { text: 'Architecture & scalability focus', included: true },
        { text: 'Continuous improvement', included: true },
      ],
      idealLine: 'Ideal for startups serious about growth.',
      cta: 'Book a Dedicated Team Call',
      contactPreset: {
        projectType: 'SaaS Product Development',
        budget: '€100K - €250K',
        messageSeed:
          'I would like to book a dedicated product team call to discuss long-term engineering capacity.',
      },
      badge: 'Most Popular',
    },
    {
      name: 'Fixed Scope Projects',
      description: 'Defined scope. Predictable delivery. No surprises.',
      bestFor: ['MVP development', 'Feature-based builds', 'Product launches'],
      features: [
        { text: 'Clear requirements & planning', included: true },
        { text: 'Fixed milestones', included: true },
        { text: 'Experienced-led execution', included: true },
        { text: 'End-to-end delivery', included: true },
        { text: 'QA & testing included', included: true },
        { text: 'Transparent timelines', included: true },
      ],
      idealLine: 'Perfect for launching validated ideas fast.',
      cta: 'Get Project Estimate',
      contactPreset: {
        projectType: 'SaaS Product Development',
        budget: '€25K - €50K',
        messageSeed: 'I need a fixed-scope project estimate with clear milestones and delivery timeline.',
      },
    },
    {
      name: 'Flexible Engineering & Consulting',
      description: 'On-demand experienced expertise when you need it',
      bestFor: ['Prototyping', 'Technical audits', 'API integrations', 'Debugging & optimization'],
      features: [
        { text: 'Flexible engagement model', included: true },
        { text: 'Fast onboarding', included: true },
        { text: 'Weekly progress updates', included: true },
        { text: 'Transparent tracking', included: true },
        { text: 'Experienced-level problem solving', included: true },
      ],
      idealLine: 'Ideal for flexible or short-term needs.',
      cta: 'Start Consultation',
      contactPreset: {
        projectType: 'Other',
        budget: '€10K - €25K',
        messageSeed: 'I am interested in flexible engineering or consulting support.',
      },
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_SELECTED_INDEX);

  return (
    <section className="bg-background py-16 sm:py-20 md:py-24 dark:bg-linear-to-b dark:from-[#1E293B] dark:to-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1.5 sm:mb-6 sm:px-4 sm:py-2">
            <Briefcase className="h-4 w-4 text-[#8B5CF6]" aria-hidden />
            <span className="text-xs font-semibold tracking-wide text-[#8B5CF6] sm:text-sm">ENGAGEMENT MODELS</span>
          </div>
          <h2 className="mb-5 bg-linear-to-r from-foreground to-[#3B82F6] bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Choose Your Engagement Model
          </h2>
          <p className="mx-auto max-w-3xl text-base font-light text-muted-foreground sm:text-lg md:text-xl">
            Flexible collaboration tailored to your product and timeline
          </p>
        </div>

        <div
          className="grid gap-6 md:grid-cols-3 md:gap-8"
          role="tablist"
          aria-label="Engagement models"
        >
          {models.map((model, index) => {
            const selected = selectedIndex === index;
            return (
            <div
              key={model.name}
              role="tab"
              tabIndex={selected ? 0 : -1}
              aria-selected={selected}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIndex(index);
                }
              }}
              className={`relative flex cursor-pointer flex-col rounded-2xl border-2 p-5 transition-all duration-300 sm:p-6 md:p-8 ${
                selected
                  ? 'border-[#06B6D4] bg-linear-to-b from-[#06B6D4]/10 to-muted/30 shadow-xl shadow-[#06B6D4]/10 dark:to-[#1E293B] dark:shadow-[#06B6D4]/20'
                  : 'border-border/60 bg-card hover:border-[#06B6D4]/30 dark:border-slate-700/50 dark:bg-[#1E293B] dark:hover:border-slate-600'
              }`}
            >
              {model.badge ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-[#8B5CF6] to-[#06B6D4] rounded-full">
                  <span className="text-sm font-bold text-white">{model.badge}</span>
                </div>
              ) : null}

              <div className="mb-6 text-center">
                <h3 className="mb-2 text-2xl font-bold text-foreground dark:text-[#F8FAFC]">{model.name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground dark:text-slate-400">{model.description}</p>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-[#06B6D4] mb-2">Best for</div>
                <ul className="text-sm text-muted-foreground dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  {model.bestFor.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className="text-sm font-semibold text-[#06B6D4] mb-3">What you get</div>
              <div className="space-y-3 mb-6 flex-1">
                {model.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <CheckCircle className="w-5 h-5 text-[#06B6D4] mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-muted-foreground dark:text-slate-300 text-sm'
                          : 'text-muted-foreground/55 dark:text-slate-600 text-sm'
                      }
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mb-6 flex items-start gap-2 border-t border-border/40 pt-4 text-sm text-muted-foreground dark:border-slate-700 dark:text-slate-400">
                <ArrowRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-foreground/80 dark:text-slate-200"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{model.idealLine}</span>
              </p>

              <ContactInquiryTrigger
                preset={model.contactPreset}
                className={`mt-auto w-full rounded-lg py-4 font-semibold transition-all ${
                  selected
                    ? 'bg-linear-to-r from-[#06B6D4] to-[#3B82F6] text-white hover:shadow-lg hover:shadow-[#06B6D4]/30'
                    : 'border border-border/60 bg-background text-foreground hover:border-[#06B6D4]/50 dark:border-slate-700 dark:bg-[#0F172A] dark:text-[#F8FAFC]'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {model.cta}
              </ContactInquiryTrigger>
            </div>
          );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-border/60 bg-linear-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 p-6 text-center sm:p-8 dark:border-[#06B6D4]/30">
          <h3 className="mb-4 text-2xl font-bold text-foreground dark:text-[#F8FAFC]">Not Sure Which Model Fits?</h3>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground dark:text-slate-300">
            Schedule a free 30-minute consultation with our team to discuss your project requirements and find the
            right engagement model.
          </p>
          <ScheduleConsultationTrigger className="inline-flex rounded-lg bg-linear-to-r from-[#06B6D4] to-[#3B82F6] px-8 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#06B6D4]/30">
            Schedule 30-Min Consultation
          </ScheduleConsultationTrigger>
        </div>
      </div>
    </section>
  );
}
