import fs from 'node:fs';
import path from 'node:path';
import type { Attachment } from 'nodemailer/lib/mailer';

export const MARKETING_LOGO_CID = 'elvoria-logo';

function resolveLogoPath(): string | null {
  const colored = path.join(process.cwd(), 'public', 'elvoria.png');
  if (fs.existsSync(colored)) return colored;
  const white = path.join(process.cwd(), 'public', 'elvoria-white.png');
  if (fs.existsSync(white)) return white;
  return null;
}

export function getMarketingEmailLogoAttachment(): Attachment[] {
  const attachmentPath = resolveLogoPath();
  if (!attachmentPath) return [];
  return [
    {
      filename: path.basename(attachmentPath),
      path: attachmentPath,
      cid: MARKETING_LOGO_CID,
    },
  ];
}

export function marketingLogoCidSrc(): string {
  return `cid:${MARKETING_LOGO_CID}`;
}
