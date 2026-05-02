import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { deleteSupportLeadAt, readSupportLeads } from '@/lib/supportLeads';

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;
  const leads = await readSupportLeads();
  return NextResponse.json({ leads });
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const index = typeof body.index === 'number' ? body.index : Number(body.index);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
  }

  const ok = await deleteSupportLeadAt(index);
  if (!ok) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
