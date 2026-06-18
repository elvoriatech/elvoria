import { ELVORIA_WEBSITE_URL } from '@/lib/emailMarketing/constants';
import { marketingCompanyName } from '@/lib/emailMarketing/companyName';

export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function marketingSiteBaseUrl(): string {
  return (process.env.SITE_URL || 'https://elvoria.tech').replace(/\/$/, '');
}

/** Hosted colored logo for the gradient header — used in both the admin preview and sent emails. */
export function marketingLogoUrl(): string {
  return `${marketingSiteBaseUrl()}/elvoria.png`;
}

export type WrapMarketingEmailOptions = {
  /** `cid:elvoria-logo` when sending; absolute URL in admin preview. */
  logoSrc: string;
  preheader?: string;
};

/** Fallback solids when gradients are stripped (Gmail/Outlook). */
const GRADIENT_CYAN = '#06b6d4';
const GRADIENT_INDIGO = '#6366f1';
const BODY_LINK = '#0891b2';

const HEADER_BG_STYLE = `background-color:${GRADIENT_CYAN};background-image:linear-gradient(135deg, ${GRADIENT_CYAN} 0%, ${GRADIENT_INDIGO} 100%);`;
const CTA_BG_STYLE = `background-color:${GRADIENT_CYAN};background-image:linear-gradient(90deg, ${GRADIENT_CYAN} 0%, ${GRADIENT_INDIGO} 100%);`;

/**
 * Professional table-based HTML shell for cold outreach (matches sent email).
 */
export function wrapMarketingEmailHtml(
  bodyHtml: string,
  opts: WrapMarketingEmailOptions
): string {
  const company = marketingCompanyName();
  const contact =
    process.env.CONTACT_EMAIL || 'contact@elvoria.tech';
  const site = ELVORIA_WEBSITE_URL;
  const preheader = escapeHtml(
    opts.preheader || `Software development partnership — ${company}`
  );
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(company)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f1f5f9" style="border-collapse:collapse;background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="border-collapse:collapse;width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,0.08);">
          <!-- Header: gradient + solid fallback; logo only (wordmark is in the image) -->
          <tr>
            <td bgcolor="${GRADIENT_CYAN}" style="${HEADER_BG_STYLE}padding:18px 28px 16px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td align="center" style="text-align:center;">
                    <a href="${site}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;border:0;">
                      <img src="${opts.logoSrc}" alt="${escapeHtml(company)}" width="108" style="display:block;margin:0 auto 8px auto;max-width:108px;width:108px;height:auto;border:0;outline:none;" />
                    </a>
                    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;font-weight:500;color:#ecfeff;line-height:1.35;letter-spacing:0.01em;mso-line-height-rule:exactly;">AI-First Digital &amp; Software Development Partner</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:36px 32px 24px 32px;">
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;line-height:1.7;color:#334155;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:8px 32px 36px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td align="center" bgcolor="${GRADIENT_CYAN}" style="${CTA_BG_STYLE}border-radius:10px;mso-padding-alt:0;">
                          <a href="${site}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 26px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;font-weight:600;line-height:1.2;color:#ffffff;text-decoration:none;border:none;border-radius:10px;mso-line-height-rule:exactly;">Visit elvoria.tech</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td bgcolor="#0f172a" style="background-color:#0f172a;padding:24px 32px;">
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;line-height:1.65;color:#94a3b8;text-align:center;">
                <a href="${site}" target="_blank" rel="noopener noreferrer" style="color:#f8fafc;font-size:13px;font-weight:600;text-decoration:none;">${escapeHtml(company)}</a><br />
                <span style="margin-top:10px;display:inline-block;">
                  <a href="mailto:${encodeURIComponent(contact)}" style="color:#67e8f9;text-decoration:none;">${escapeHtml(contact)}</a>
                  &nbsp;·&nbsp;
                  <a href="${site}" style="color:#67e8f9;text-decoration:none;">elvoria.tech</a>
                </span><br />
                <span style="color:#64748b;margin-top:10px;display:inline-block;">GDPR-aware engineering · EU delivery</span><br />
                <span style="color:#475569;margin-top:8px;display:inline-block;">© ${year} <a href="${site}" style="color:#67e8f9;text-decoration:none;">${escapeHtml(company)}</a>. All rights reserved.</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Inline styles for common tags produced by the rich editor (email-client safe). */
export function normalizeMarketingBodyHtml(fragment: string): string {
  let html = fragment.trim();
  if (!html) {
    return '<p style="margin:0 0 16px 0;color:#64748b;">(Empty message)</p>';
  }
  html = html
    .replace(/<h2>/gi, '<h2 style="margin:28px 0 12px 0;font-size:17px;font-weight:700;color:#0f172a;line-height:1.3;">')
    .replace(/<h3>/gi, '<h3 style="margin:22px 0 10px 0;font-size:15px;font-weight:700;color:#0f172a;line-height:1.35;">')
    .replace(/<p>/gi, '<p style="margin:0 0 16px 0;color:#334155;">')
    .replace(/<li>/gi, '<li style="margin:0 0 8px 0;color:#334155;line-height:1.55;">')
    .replace(/<ul>/gi, '<ul style="margin:0 0 18px 0;padding-left:22px;color:#334155;">')
    .replace(/<ol>/gi, '<ol style="margin:0 0 18px 0;padding-left:22px;color:#334155;">')
    .replace(/<em>/gi, '<em style="font-style:italic;color:#475569;">')
    .replace(
      /<a (?![^>]*style=)/gi,
      `<a style="color:${BODY_LINK};font-weight:600;text-decoration:underline;" `
    )
    .replace(/<a style="color:#0c4a6e/gi, `<a style="color:${BODY_LINK}`)
    .replace(/<a style="color:#0891b2/gi, `<a style="color:${BODY_LINK}`)
    .replace(/<strong>/gi, '<strong style="font-weight:600;color:#0f172a;">');
  return html;
}

export function buildFullMarketingEmailHtml(
  bodyHtml: string,
  opts: WrapMarketingEmailOptions
): string {
  return wrapMarketingEmailHtml(normalizeMarketingBodyHtml(bodyHtml), opts);
}
