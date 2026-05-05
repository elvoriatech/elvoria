import type { MetadataRoute } from 'next';

function siteUrl(): string {
  const raw = (process.env.SITE_URL || 'https://elvoriatech.com').trim();
  return raw.replace(/\/$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}

