import fs from 'node:fs/promises';
import path from 'node:path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'support-leads.json');

export type SupportLeadSource = 'proposal_widget' | 'contact_technical_proposal';

export type SupportLeadRecord = {
  /** ISO 8601 UTC when the lead was saved */
  timestamp: string;
  source: SupportLeadSource;
  fullName: string;
  email: string;
  company: string;
  phone: string;
};

export async function readSupportLeads(): Promise<SupportLeadRecord[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SupportLeadRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeSupportLeads(leads: SupportLeadRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

/** Append one record to `data/support-leads.json` (array of objects, each with `timestamp`). */
export async function appendSupportLead(
  record: Omit<SupportLeadRecord, 'timestamp'> & { timestamp?: string }
): Promise<void> {
  const entry: SupportLeadRecord = {
    ...record,
    timestamp: record.timestamp ?? new Date().toISOString(),
  };
  const existing = await readSupportLeads();
  existing.push(entry);
  await writeSupportLeads(existing);
}

/** Remove one lead by zero-based index. Returns false if index out of range. */
export async function deleteSupportLeadAt(index: number): Promise<boolean> {
  const leads = await readSupportLeads();
  if (!Number.isInteger(index) || index < 0 || index >= leads.length) return false;
  leads.splice(index, 1);
  await writeSupportLeads(leads);
  return true;
}
