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

export function parseRecipientExcel(buffer: Buffer): Array<{
  contactName: string;
  email: string;
  companyName: string;
  industry: string;
}> {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const out: Array<{ contactName: string; email: string; companyName: string; industry: string }> = [];

  for (const row of raw) {
    const normalized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      normalized[normHeader(String(k))] = v;
    }
    const email = pick(normalized, ['email', 'e-mail', 'mail']);
    if (!email) continue;
    out.push({
      contactName: pick(normalized, ['first name', 'firstname', 'name', 'contact', 'contact person']),
      email,
      companyName: pick(normalized, ['company name', 'company', 'organization']),
      industry: pick(normalized, ['industry', 'sector']),
    });
  }
  return out;
}
