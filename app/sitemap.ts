import type { MetadataRoute } from 'next';
import { SEO_LANDING_PAGES } from '@/lib/seoLandingPages';

function siteUrl(): string {
  const raw = (process.env.SITE_URL || 'https://elvoriatech.com').trim();
  return raw.replace(/\/$/, '');
}

export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl();
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    {
      url: `${site}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${site}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const seoPages: MetadataRoute.Sitemap = SEO_LANDING_PAGES.map((p) => ({
    url: `${site}/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  return [...base, ...seoPages];
}

