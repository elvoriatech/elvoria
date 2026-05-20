import { ELVORIA_WEBSITE_URL } from '@/lib/emailMarketing/constants';
import type { EmailTemplateType } from '@/lib/emailMarketing/types';

/** Plain-text line stored before the website link was added. */
export const LEGACY_CALL_INVITE_LINE =
  'Would you be open to a quick 10–15 minute call this week?';

export const CALL_INVITE_LINE_HTML = `Would you be open to a <a href="${ELVORIA_WEBSITE_URL}">quick 10–15 minute call this week</a>?`;

const LINK_STYLE = 'color:#0891b2;font-weight:600;text-decoration:underline;';

/** Linked brand name for template body copy. */
export function elvoriaBrandLink(label = 'Elvoria Tech'): string {
  return `<a href="${ELVORIA_WEBSITE_URL}" style="${LINK_STYLE}"><strong>${label}</strong></a>`;
}

const H3 =
  'margin:22px 0 10px 0;font-size:15px;font-weight:700;color:#0f172a;line-height:1.35;';

const INITIAL_BODY = `<p>Hi [First Name],</p>

<p>I hope you're doing well.</p>

<p>I'm reaching out from ${elvoriaBrandLink()}, a software development team specializing in building modern, scalable digital products for startups and growing businesses.</p>

<p>We help companies design, develop, and improve high-performance applications that focus on <strong>user experience</strong>, <strong>scalability</strong>, and <strong>business growth</strong>.</p>

<h3 style="${H3}">Our core expertise includes</h3>
<ul>
<li><strong>Web Applications</strong> — React, Next.js, Angular, Vue</li>
<li><strong>Backend Development</strong> — Node.js, Java, Spring Boot, Python</li>
<li><strong>Mobile Applications</strong> — Hybrid &amp; Native</li>
<li><strong>Cloud &amp; AWS Serverless</strong> architectures</li>
<li><strong>SaaS Product Development</strong></li>
<li><strong>UI/UX Modernization</strong> &amp; redesign</li>
</ul>

<h3 style="${H3}">We typically support teams with</h3>
<ul>
<li>Building new SaaS or MVP products from scratch</li>
<li>Improving or rebuilding existing applications</li>
<li>Enhancing performance, scalability, and UX</li>
<li>Accelerating product delivery for startups</li>
</ul>

<h3 style="${H3}">If you're planning new development, we can help with</h3>
<ul>
<li>Share relevant case studies</li>
<li>Provide technical suggestions <em>(no-cost initial review)</em></li>
<li>Explore how we can support your roadmap</li>
</ul>

<p>${CALL_INVITE_LINE_HTML}</p>

<p>Looking forward to your thoughts.</p>

<p>Best regards,<br />
${elvoriaBrandLink('Elvoria Tech Team')}<br />
<a href="${ELVORIA_WEBSITE_URL}">elvoriatech.com</a></p>`;

const FOLLOW_UP_1_BODY = `<p>Hi [First Name],</p>

<p>Just following up on my previous email — I wanted to check if you had a chance to review it.</p>

<p>If you're currently not looking for development support, no worries at all. We'd be happy to stay in touch for future needs.</p>

<p>Looking forward to your thoughts.</p>

<p>Best regards,<br />
${elvoriaBrandLink('Elvoria Tech Team')}<br />
<a href="${ELVORIA_WEBSITE_URL}">elvoriatech.com</a></p>`;

const FOLLOW_UP_2_BODY = `<p>Hi [First Name],</p>

<p>Just a final follow-up from my side. If now is not the right time, we completely understand.</p>

<p>We'll be happy to connect whenever you're planning product development or technical improvements.</p>

<p>Wishing you great success with your project.</p>

<p>Best regards,<br />
${elvoriaBrandLink('Elvoria Tech Team')}<br />
<a href="${ELVORIA_WEBSITE_URL}">elvoriatech.com</a></p>`;

function applySiteLinks(html: string): string {
  const site = ELVORIA_WEBSITE_URL.replace(/\/$/, '');
  const bareUrl = ELVORIA_WEBSITE_URL;
  if (html.includes(`href="${bareUrl}"`) || html.includes(`href="${site}/"`)) {
    return html;
  }
  return html.replace(
    new RegExp(site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\/?', 'g'),
    `<a href="${ELVORIA_WEBSITE_URL}">elvoriatech.com</a>`
  );
}

function toTemplateBody(html: string): string {
  return applySiteLinks(html.trim());
}

export const DEFAULT_TEMPLATES: Record<
  EmailTemplateType,
  { subject: string; bodyHtml: string }
> = {
  initial: {
    subject: 'Quick intro for [Company Name] — Elvoria Tech',
    bodyHtml: toTemplateBody(INITIAL_BODY),
  },
  follow_up_1: {
    subject: 'Following up with [Company Name] — Elvoria Tech',
    bodyHtml: toTemplateBody(FOLLOW_UP_1_BODY),
  },
  follow_up_2: {
    subject: 'Last follow-up for [Company Name] — Elvoria Tech',
    bodyHtml: toTemplateBody(FOLLOW_UP_2_BODY),
  },
};
