import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { parseRecipientExcel } from '@/lib/emailMarketing/parseExcel';
import { upsertRecipientsFromRows } from '@/lib/emailMarketing/store';

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    const name = file instanceof File ? file.name.toLowerCase() : '';
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Upload .xlsx or .xls only' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = parseRecipientExcel(buffer);
    if (!rows.length) {
      return NextResponse.json({ error: 'No valid rows found. Expected a header row with at least Business Name (or Company Name) and Email.' }, { status: 400 });
    }
    const result = await upsertRecipientsFromRows(rows);
    return NextResponse.json(result);
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
