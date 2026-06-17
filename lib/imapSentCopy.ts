type ImapConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
};

/**
 * IMAP connection used to drop a copy of each outbound message into the mailbox
 * "Sent" folder (SMTP alone never populates Sent).
 *
 * Defaults are derived from the SMTP/email settings:
 *   IMAP_HOST     ← falls back to EMAIL_HOST with `smtp.` swapped for `imap.` (e.g. imap.ionos.de)
 *   IMAP_PORT     ← 993 (implicit TLS)
 *   IMAP_USER     ← EMAIL_USER
 *   IMAP_PASSWORD ← EMAIL_PASSWORD
 * Set IMAP_SAVE_SENT=false to disable saving copies.
 */
function imapConfig(): ImapConfig | null {
  const host =
    process.env.IMAP_HOST?.trim() ||
    process.env.EMAIL_HOST?.trim()?.replace(/^smtp\./i, 'imap.');
  const user = process.env.IMAP_USER?.trim() || process.env.EMAIL_USER?.trim();
  const pass = (process.env.IMAP_PASSWORD ?? process.env.EMAIL_PASSWORD ?? '').trim();

  if (!host || !user || !pass) return null;

  const port = Number(process.env.IMAP_PORT?.trim() || 993);
  return { host, port, secure: port !== 143, auth: { user, pass } };
}

export function isImapSentCopyEnabled(): boolean {
  if (/^false$/i.test(process.env.IMAP_SAVE_SENT?.trim() || '')) return false;
  return imapConfig() !== null;
}

/** Best-effort: append a raw RFC822 message to the mailbox "Sent" folder. */
export async function appendToSentFolder(raw: Buffer | string): Promise<void> {
  const config = imapConfig();
  if (!config) return;

  const { ImapFlow } = await import('imapflow');
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    logger: false,
  });

  try {
    await client.connect();
    const mailbox = await resolveSentMailbox(client);
    await client.append(mailbox, raw, ['\\Seen']);
  } finally {
    await client.logout().catch(() => {});
  }
}

/** Find the special-use "\Sent" mailbox; fall back to common names. */
async function resolveSentMailbox(client: import('imapflow').ImapFlow): Promise<string> {
  try {
    const boxes = await client.list();
    const special = boxes.find((b) => b.specialUse === '\\Sent');
    if (special) return special.path;
    const byName = boxes.find((b) => /^(sent|sent items|sent mail)$/i.test(b.name));
    if (byName) return byName.path;
  } catch {
    // fall through to default
  }
  return 'Sent';
}
