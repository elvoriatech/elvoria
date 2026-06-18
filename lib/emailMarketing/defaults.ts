import {
  marketingCompanyName,
  marketingCompanyTeamLabel,
} from '@/lib/emailMarketing/companyName';
import {
  elvoriaConsultationScheduleUrl,
  elvoriaWebsiteBase,
  elvoriaWebsiteHostname,
  elvoriaWebsiteUrl,
} from '@/lib/emailMarketing/siteUrl';
import type { EmailTemplateType } from '@/lib/emailMarketing/types';

/** Plain-text line stored before the website link was added. */
export const LEGACY_CALL_INVITE_LINE =
  'Would you be open to a quick 10–15 minute call this week?';

export function buildCallInviteLineHtml(): string {
  const scheduleUrl = elvoriaConsultationScheduleUrl();
  return `Would you be open to a <a href="${scheduleUrl}">quick 10–15 minute call this week</a>?`;
}

const LINK_STYLE = 'color:#0891b2;font-weight:600;text-decoration:underline;';

/** Linked brand name for template body copy. */
export function elvoriaBrandLink(label = marketingCompanyName()): string {
  return `<a href="${elvoriaWebsiteUrl()}" style="${LINK_STYLE}"><strong>${label}</strong></a>`;
}

const H3 =
  'margin:22px 0 10px 0;font-size:15px;font-weight:700;color:#0f172a;line-height:1.35;';

function siteLinkHtml(): string {
  const host = elvoriaWebsiteHostname();
  return `<a href="${elvoriaWebsiteUrl()}">${host}</a>`;
}

function buildInitialBody(): string {
  const team = marketingCompanyTeamLabel();
  return `<p>Hi [First Name],</p>

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

<p>${buildCallInviteLineHtml()}</p>

<p>Looking forward to your thoughts.</p>

<p>Best regards,<br />
${elvoriaBrandLink(team)}<br />
${siteLinkHtml()}</p>`;
}

function buildFollowUp1Body(): string {
  const team = marketingCompanyTeamLabel();
  return `<p>Hi [First Name],</p>

<p>Just following up on my previous email — I wanted to check if you had a chance to review it.</p>

<p>If you're currently not looking for development support, no worries at all. We'd be happy to stay in touch for future needs.</p>

<p>Looking forward to your thoughts.</p>

<p>Best regards,<br />
${elvoriaBrandLink(team)}<br />
${siteLinkHtml()}</p>`;
}

function buildFollowUp2Body(): string {
  const team = marketingCompanyTeamLabel();
  return `<p>Hi [First Name],</p>

<p>Just a final follow-up from my side. If now is not the right time, we completely understand.</p>

<p>We'll be happy to connect whenever you're planning product development or technical improvements.</p>

<p>Wishing you great success with your project.</p>

<p>Best regards,<br />
${elvoriaBrandLink(team)}<br />
${siteLinkHtml()}</p>`;
}

function applySiteLinks(html: string): string {
  const site = elvoriaWebsiteUrl();
  const base = elvoriaWebsiteBase();
  const host = elvoriaWebsiteHostname();
  if (html.includes(`href="${site}"`) || html.includes(`href="${base}/"`)) {
    return html;
  }
  return html.replace(
    new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\/?', 'g'),
    `<a href="${site}">${host}</a>`
  );
}

function toTemplateBody(html: string): string {
  return applySiteLinks(html.trim());
}

/** Built-in template defaults for customer-facing outreach. */
export function getDefaultTemplates(): Record<
  EmailTemplateType,
  { subject: string; bodyHtml: string }
> {
  const brand = marketingCompanyName();
  return {
    initial: {
      subject: `Quick intro for [Company Name] — ${brand}`,
      bodyHtml: toTemplateBody(buildInitialBody()),
    },
    follow_up_1: {
      subject: `Following up with [Company Name] — ${brand}`,
      bodyHtml: toTemplateBody(buildFollowUp1Body()),
    },
    follow_up_2: {
      subject: `Last follow-up for [Company Name] — ${brand}`,
      bodyHtml: toTemplateBody(buildFollowUp2Body()),
    },
  };
}
