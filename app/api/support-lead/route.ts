import { NextRequest, NextResponse } from 'next/server';
import { appendSupportLead, type SupportLeadSource } from '@/lib/supportLeads';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimStr(s: unknown, max: number): string {
  const t = typeof s === 'string' ? s.trim() : '';
  if (t.length > max) return t.slice(0, max);
  return t;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const fullName = trimStr(body.fullName, 120);
    const email = trimStr(body.email, 254).toLowerCase();
    const company = trimStr(body.company, 200);
    const phone = trimStr(body.phone, 60);
    const rawSource = typeof body.source === 'string' ? body.source : '';
    const source: SupportLeadSource =
      rawSource === 'contact_technical_proposal' ? 'contact_technical_proposal' : 'proposal_widget';

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!company) {
      return NextResponse.json({ error: 'Company is required' }, { status: 400 });
    }

    await appendSupportLead({
      source,
      fullName,
      email,
      company,
      phone: phone || '',
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[support-lead]', e);
    return NextResponse.json({ error: 'Could not save your details' }, { status: 500 });
  }
}
