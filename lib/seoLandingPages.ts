export type SeoLandingPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  bullets: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
};

export const SEO_LANDING_PAGES: SeoLandingPage[] = [
  {
    slug: 'nodejs-development',
    title: 'Node.js Development Services',
    description:
      'Build fast, scalable Node.js backends and APIs. Elvoriatech delivers production-ready Node.js systems with clean architecture, performance, and security.',
    h1: 'Node.js Development Services',
    intro:
      'We design and build Node.js systems that are reliable under real production load: APIs, SaaS backends, real-time services, and integrations.',
    bullets: ['API & backend engineering', 'Performance & scalability', 'Security hardening', 'Cloud-native deployment'],
    primaryCtaLabel: 'Book a call',
    primaryCtaHref: '/#contact',
  },
  {
    slug: 'angular-development',
    title: 'Angular Development Services',
    description:
      'Enterprise-grade Angular development for dashboards and complex web apps. Modern UI architecture, performance, and maintainable components.',
    h1: 'Angular Development Services',
    intro:
      'We build Angular applications for enterprise teams: admin portals, analytics dashboards, and internal tools with strong DX and predictable delivery.',
    bullets: ['Component architecture', 'State management', 'Design systems', 'Testing & performance'],
    primaryCtaLabel: 'Get a quote',
    primaryCtaHref: '/#contact',
  },
  {
    slug: 'saas-development',
    title: 'Custom SaaS Development',
    description:
      'AI-first, cloud-native SaaS development: multi-tenant architecture, billing, role-based access, and scalable infrastructure for growth.',
    h1: 'Custom SaaS Development',
    intro:
      'From MVP to enterprise scale: we build SaaS platforms with the foundations that matter—multi-tenancy, security, analytics, and smooth UX.',
    bullets: ['Multi-tenancy & RBAC', 'Payments & subscriptions', 'Cloud architecture', 'AI features (RAG/automation)'],
    primaryCtaLabel: 'Book a call',
    primaryCtaHref: '/#contact',
  },
  {
    slug: 'api-development',
    title: 'API Development Services',
    description:
      'Design and build secure, well-documented APIs. REST/GraphQL, auth, rate limits, observability, and integration-ready architecture.',
    h1: 'API Development Services',
    intro:
      'We ship APIs that teams trust: stable contracts, security-first, and built to integrate with partners, mobile apps, and internal systems.',
    bullets: ['REST/GraphQL', 'Auth & access control', 'Monitoring & logging', 'Integration-ready design'],
    primaryCtaLabel: 'Talk to an engineer',
    primaryCtaHref: '/#contact',
  },
  {
    slug: 'hire-nodejs-developers',
    title: 'Hire Node.js Developers',
    description:
      'Hire dedicated Node.js developers in Europe time zones. Senior engineers for SaaS backends, APIs, integrations, and performance work.',
    h1: 'Hire Node.js Developers',
    intro:
      'Augment your team with senior Node.js engineers. We integrate fast, ship predictably, and keep quality high with clean engineering practices.',
    bullets: ['Dedicated team options', 'Senior engineering', 'Clear delivery process', 'Europe-friendly collaboration'],
    primaryCtaLabel: 'Request availability',
    primaryCtaHref: '/#contact',
  },
  {
    slug: 'dedicated-development-team-europe',
    title: 'Dedicated Development Team (Europe)',
    description:
      'Dedicated development teams aligned with Europe time zones. Full-stack delivery with AI-first engineering, DevOps, and product support.',
    h1: 'Dedicated Development Team (Europe)',
    intro:
      'A reliable delivery partner for B2B SaaS: strong communication, predictable cadence, and engineering that scales.',
    bullets: ['Full-stack teams', 'DevOps & CI/CD', 'Security & compliance', 'Long-term partnership'],
    primaryCtaLabel: 'Book a call',
    primaryCtaHref: '/#contact',
  },
  {
    slug: 'software-development-germany',
    title: 'Software Development in Germany',
    description:
      'Software development services for Germany-based companies: SaaS, AI solutions, and cloud-native systems. Delivery aligned with EU expectations.',
    h1: 'Software Development in Germany',
    intro:
      'We help German and EU companies ship scalable software with strong engineering discipline, security, and production reliability.',
    bullets: ['EU-friendly delivery', 'Security-first engineering', 'SaaS & AI expertise', 'Reliable project management'],
    primaryCtaLabel: 'Book a call',
    primaryCtaHref: '/#contact',
  },
  {
    slug: 'software-development-netherlands',
    title: 'Software Development in the Netherlands',
    description:
      'Software development for Netherlands-based businesses: web platforms, SaaS products, and AI-first systems built for scale.',
    h1: 'Software Development in the Netherlands',
    intro:
      'We partner with Dutch companies to design and build modern software—fast delivery, clean architecture, and strong UX.',
    bullets: ['SaaS platforms', 'API development', 'Cloud architecture', 'AI-first roadmaps'],
    primaryCtaLabel: 'Get a quote',
    primaryCtaHref: '/#contact',
  },
  {
    slug: 'software-development-sweden',
    title: 'Software Development in Sweden',
    description:
      'Software development services for Sweden: scalable SaaS, enterprise web apps, and AI solutions with cloud-native delivery.',
    h1: 'Software Development in Sweden',
    intro:
      'We build high-quality software for Swedish and EU teams with a focus on reliability, performance, and long-term maintainability.',
    bullets: ['Enterprise web apps', 'SaaS & platforms', 'Observability & reliability', 'AI-powered features'],
    primaryCtaLabel: 'Book a call',
    primaryCtaHref: '/#contact',
  },
] as const;

export const SEO_LANDING_PAGES_BY_SLUG: Record<string, SeoLandingPage> = Object.fromEntries(
  SEO_LANDING_PAGES.map((p) => [p.slug, p])
);

