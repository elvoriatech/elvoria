/** Shared transactional HTML email layout (matches site: dark shell, cyan/violet accents). */

export function escapeHtmlEmail(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderElvoriaEmailShell(params: {
  title: string;
  preheader: string;
  contentHtml: string;
  showTimestamp?: boolean;
  /** <img src="..."> — use cid:elvoria-mark when mail includes inline attachment, or absolute https URL */
  logoImgSrc: string;
  /** Small print above copyright */
  footerNoteHtml: string;
}) {
  const { title, preheader, contentHtml, showTimestamp = true, logoImgSrc, footerNoteHtml } = params;

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtmlEmail(title)}</title>
    <style>
      @media (max-width: 480px) {
        .container { padding: 20px 12px !important; }
        .card { padding: 16px !important; }
        .h1 { font-size: 18px !important; }
        .p { font-size: 13px !important; }
        .grid td { display:block !important; width:100% !important; }
        .grid td + td { margin-top:10px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#070b14;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtmlEmail(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#070b14;">
      <tr>
        <td align="center" class="container" style="padding:32px 16px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;max-width:640px;">
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="vertical-align:middle;padding-right:12px;">
                            <img src="${logoImgSrc}" alt="" width="36" height="36" style="display:block;border-radius:10px;box-shadow:0 10px 26px rgba(34,211,238,0.18);" />
                          </td>
                          <td style="vertical-align:middle;">
                            <div style="font-size:14px;font-weight:700;letter-spacing:0.3px;color:#ffffff;line-height:1.2;">
                              Elvoria Technologies
                            </div>
                            <div style="font-size:12px;color:#94a3b8;line-height:1.2;margin-top:2px;">
                              AI-First Digital &amp; Software Development Partner
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    ${
                      showTimestamp
                        ? `<td align="right" style="vertical-align:middle;">
                      <div style="font-size:12px;color:#94a3b8;">${new Date().toLocaleString()}</div>
                    </td>`
                        : `<td align="right" style="vertical-align:middle;"></td>`
                    }
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="card" style="background:linear-gradient(135deg, rgba(139,92,246,0.16), rgba(6,182,212,0.10));border:1px solid rgba(255,255,255,0.10);border-radius:18px;padding:22px 22px 18px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
                ${contentHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:14px 4px 0 4px;">
                <div style="font-size:12px;color:#94a3b8;line-height:1.6;">
                  ${footerNoteHtml}
                </div>
                <div style="margin-top:10px;font-size:11px;color:#64748b;line-height:1.6;">
                  © ${new Date().getFullYear()} Elvoria Technologies. All rights reserved.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
