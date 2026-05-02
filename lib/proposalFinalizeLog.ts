import fs from 'node:fs/promises';
import path from 'node:path';
import { proposalPdfPath } from '@/lib/localStore';

const LOG_FILE = path.join(process.cwd(), 'data', 'proposal-finalize-log.json');

const MAX_ENTRIES = 250;

export type ProposalFinalizeLogEntry = {
  versionId: string;
  conversationId: string;
  visitorEmail: string;
  visitorName: string;
  pdfStatus: 'ready' | 'failed' | 'queued';
  pdfError?: string;
  finalizedAt: string;
  /** When PDF was not ready: whether the visitor received the “we’ll follow up with a PDF” email (if mail is configured). */
  visitorNotifiedPdfIssue?: boolean;
  /** When admin used “Send PDF by email” successfully. */
  pdfEmailedByAdminAt?: string;
};

export type AdminProposalQueueRow = ProposalFinalizeLogEntry & {
  /** True if `data/proposals/<versionId>.pdf` exists on disk (admin can view/send). */
  pdfFilePresent: boolean;
};

async function pdfExistsOnDisk(versionId: string): Promise<boolean> {
  try {
    await fs.access(proposalPdfPath(versionId));
    return true;
  } catch {
    return false;
  }
}

export async function updateProposalFinalizeLogEntry(
  versionId: string,
  patch: Partial<Pick<ProposalFinalizeLogEntry, 'pdfEmailedByAdminAt' | 'visitorNotifiedPdfIssue'>>
): Promise<boolean> {
  const entries = await readProposalFinalizeLog();
  const idx = entries.findIndex((e) => e.versionId === versionId);
  if (idx === -1) return false;
  entries[idx] = { ...entries[idx], ...patch };
  await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
  await fs.writeFile(LOG_FILE, JSON.stringify(entries, null, 2), 'utf8');
  return true;
}

export async function appendProposalFinalizeLog(entry: ProposalFinalizeLogEntry): Promise<void> {
  let list: ProposalFinalizeLogEntry[] = [];
  try {
    const raw = await fs.readFile(LOG_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) list = parsed as ProposalFinalizeLogEntry[];
  } catch {
    list = [];
  }
  list.unshift(entry);
  if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
  await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
  await fs.writeFile(LOG_FILE, JSON.stringify(list, null, 2), 'utf8');
}

export async function readProposalFinalizeLog(): Promise<ProposalFinalizeLogEntry[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ProposalFinalizeLogEntry[]) : [];
  } catch {
    return [];
  }
}

/** Log entries enriched for admin UI (PDF file on disk, etc.). */
export async function readProposalFinalizeLogForAdmin(): Promise<AdminProposalQueueRow[]> {
  const entries = await readProposalFinalizeLog();
  const out: AdminProposalQueueRow[] = [];
  for (const e of entries) {
    const onDisk = await pdfExistsOnDisk(e.versionId);
    out.push({
      ...e,
      pdfFilePresent: onDisk,
    });
  }
  return out;
}

export async function getLogEntryByVersionId(versionId: string): Promise<ProposalFinalizeLogEntry | null> {
  const entries = await readProposalFinalizeLog();
  return entries.find((e) => e.versionId === versionId) ?? null;
}
