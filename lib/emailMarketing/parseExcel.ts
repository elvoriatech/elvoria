import * as XLSX from 'xlsx';

function normHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pick(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

/** Accepted header aliases (normalized: lowercased, single-spaced). */
const EMAIL_KEYS = ['email', 'e-mail', 'mail', 'email address', 'e-mail address'];
const COMPANY_KEYS = [
  'business name',
  'company name',
  'company',
  'business',
  'organization',
  'organisation',
  'firm',
];
const INDUSTRY_KEYS = [
  'type / branche',
  'type/branche',
  'branche',
  'industry',
  'sector',
  'type',
  'category',
];
const CONTACT_KEYS = [
  'first name',
  'firstname',
  'contact name',
  'contact person',
  'contact',
  'full name',
  'name',
];

export type ParsedRecipient = {
  contactName: string;
  email: string;
  companyName: string;
  industry: string;
};

function rowsFromSheet(sheet: XLSX.WorkSheet): ParsedRecipient[] {
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const out: ParsedRecipient[] = [];

  for (const row of raw) {
    const normalized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      normalized[normHeader(String(k))] = v;
    }
    const email = pick(normalized, EMAIL_KEYS);
    if (!email) continue;
    out.push({
      contactName: pick(normalized, CONTACT_KEYS),
      email,
      companyName: pick(normalized, COMPANY_KEYS),
      industry: pick(normalized, INDUSTRY_KEYS),
    });
  }
  return out;
}

/**
 * Parses recipients from an uploaded workbook. Header names are flexible
 * (e.g. "Business Name" or "Company Name", "Type / Branche" or "Industry").
 * Multi-sheet files are supported: the first sheet that contains email rows wins.
 */
export function parseRecipientExcel(buffer: Buffer): ParsedRecipient[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const rows = rowsFromSheet(sheet);
    if (rows.length) return rows;
  }
  return [];
}
