import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopBar } from '@/app/components/TopBar';
import { Footer } from '@/app/components/Footer';
import { SEO_LANDING_PAGES, SEO_LANDING_PAGES_BY_SLUG } from '@/lib/seoLandingPages';

type Props = { params: Promise<{ slug: string }> };

function siteUrl(): string {
  const raw = (process.env.SITE_URL || 'https://elvoria.tech').trim();
  return raw.replace(/\/$/, '');
}

export function generateStaticParams() {
  return SEO_LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = SEO_LANDING_PAGES_BY_SLUG[slug];
  if (!page) return {};
  const canonical = `/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: page.title,
      description: page.description,
      siteName: 'Elvoria Technologies',
      images: [{ url: '/elvoria.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: ['/elvoria.png'],
    },
  };
}

export default async function SeoLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = SEO_LANDING_PAGES_BY_SLUG[slug];
  if (!page) notFound();

  const site = siteUrl();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-xl dark:border-white/10 dark:bg-linear-to-br dark:from-[#0F172A] dark:to-[#0B1220]">
          <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-70">
            <div className="mesh-hero h-full w-full" />
          </div>
          <div className="relative">
            <p className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-black/20">
              SEO landing page · Elvoria Technologies
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-linear-to-r from-(--brand-accent) to-(--brand-primary) bg-clip-text text-transparent">
                {page.h1}
              </span>
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {page.intro}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={page.primaryCtaHref}
                className="rounded-xl bg-linear-to-r from-(--brand-accent) to-(--brand-primary) px-5 py-3 text-sm font-bold text-white shadow-lg shadow-(color:--brand-primary)/25 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60"
              >
                {page.primaryCtaLabel}
              </Link>
              <a
                href={`${site}/about`}
                className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/5"
              >
                About Elvoria Technologies
              </a>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-6 dark:border-white/10 dark:bg-white/3">
            <h2 className="text-xl font-bold text-foreground">What we deliver</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {page.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-(--brand-accent)" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 dark:border-white/10 dark:bg-white/3">
            <h2 className="text-xl font-bold text-foreground">Fast next step</h2>
            <p className="mt-4 text-muted-foreground">
              Share your requirements and we’ll respond with a clear plan: scope, timeline, and an indicative cost range.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/#contact"
                className="rounded-xl border border-[#06B6D4]/50 bg-[#06B6D4]/10 px-4 py-2.5 text-sm font-semibold text-[#0e7490] hover:bg-[#06B6D4]/20 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-500/25"
              >
                Contact form
              </Link>
              <Link
                href="/#services"
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/5"
              >
                See services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

