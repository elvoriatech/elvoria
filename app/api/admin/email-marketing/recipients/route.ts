import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { createRecipient, deleteRecipient, listRecipients, markRecipientReplied } from '@/lib/emailMarketing/store';

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const recipients = await listRecipients();
    return NextResponse.json({ recipients });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const recipient = await createRecipient({
      companyName: typeof body.companyName === 'string' ? body.companyName : '',
      contactName: typeof body.contactName === 'string' ? body.contactName : '',
      email: typeof body.email === 'string' ? body.email : '',
      industry: typeof body.industry === 'string' ? body.industry : '',
      notes: typeof body.notes === 'string' ? body.notes : '',
    });
    return NextResponse.json({ recipient });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const ok = await deleteRecipient(id);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    if (body.markReplied === true) {
      await markRecipientReplied(id);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
