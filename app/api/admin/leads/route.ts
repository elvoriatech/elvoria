import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { deleteSupportLeadById, readSupportLeads } from '@/lib/supportLeads';
import { crmErrorResponse } from '@/lib/crmApiError';

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const leads = await readSupportLeads();
    return NextResponse.json({ leads });
  } catch (e) {
    const crm = crmErrorResponse(e);
    if (crm) return crm;
    throw e;
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const leadId = typeof body.id === 'string' ? body.id.trim() : '';
    if (!leadId) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const ok = await deleteSupportLeadById(leadId);
    if (!ok) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const crm = crmErrorResponse(e);
    if (crm) return crm;
    throw e;
  }
}
