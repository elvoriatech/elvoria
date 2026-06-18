import { buildFullMarketingEmailHtml } from '@/lib/emailMarketing/emailLayout';
import {
  getMarketingEmailLogoAttachment,
  marketingLogoCidSrc,
} from '@/lib/emailMarketing/emailLogoAttachment';
import { marketingCompanyTeamLabel } from '@/lib/emailMarketing/companyName';
import { elvoriaBrandLink } from '@/lib/emailMarketing/defaults';
import { elvoriaWebsiteHostname, elvoriaWebsiteUrl } from '@/lib/emailMarketing/siteUrl';

const BODY_LINK = 'color:#0891b2;font-weight:600;text-decoration:underline;';

/** Same shell + logo as initial outreach (`wrapMarketingEmailHtml`). */
export function buildVisitorAutoReplyHtml(bodyHtml: string, preheader: string): string {
  return buildFullMarketingEmailHtml(bodyHtml, {
    logoSrc: marketingLogoCidSrc(),
    preheader,
  });
}

export function visitorAutoReplyAttachments() {
  return getMarketingEmailLogoAttachment();
}

export function visitorAutoReplySignOff(): string {
  const host = elvoriaWebsiteHostname();
  return `<p>Best regards,<br />
${elvoriaBrandLink(marketingCompanyTeamLabel())}<br />
<a href="${elvoriaWebsiteUrl()}" style="${BODY_LINK}">${host}</a></p>`;
}

export function visitorAutoReplyMailtoLink(email: string, label?: string): string {
  const safe = email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<a href="mailto:${encodeURIComponent(email)}" style="${BODY_LINK}">${label ?? safe}</a>`;
}

/** Light card block (matches outreach body palette). */
export function visitorAutoReplyInfoBox(label: string, contentHtml: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin:0 0 18px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
    <tr>
      <td style="padding:14px 16px;">
        <div style="font-size:12px;font-weight:600;color:#64748b;margin:0 0 6px 0;letter-spacing:0.04em;">${label}</div>
        <div style="font-size:14px;line-height:1.6;color:#334155;">${contentHtml}</div>
      </td>
    </tr>
  </table>`;
}
