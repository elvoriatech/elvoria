import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { RECIPIENTS_PAGE_SIZE } from '@/lib/emailMarketing/constants';
import {
  createRecipient,
  deleteRecipient,
  listRecipientIdsByStatus,
  listRecipientsPaginated,
  markRecipientReplied,
} from '@/lib/emailMarketing/store';
import type { RecipientStatus } from '@/lib/emailMarketing/types';

const STATUSES = new Set<RecipientStatus>(['not_sent', 'sent', 'replied']);

export async function GET(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const sp = request.nextUrl.searchParams;
    const idsOnly = sp.get('idsOnly') === 'true';
    const statusRaw = sp.get('status');
    const status = statusRaw && STATUSES.has(statusRaw as RecipientStatus) ? (statusRaw as RecipientStatus) : undefined;

    if (idsOnly && status) {
      const ids = await listRecipientIdsByStatus(status);
      return NextResponse.json({ ids, total: ids.length });
    }

    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const pageSize = Math.min(
      RECIPIENTS_PAGE_SIZE,
      Math.max(1, parseInt(sp.get('pageSize') || String(RECIPIENTS_PAGE_SIZE), 10) || RECIPIENTS_PAGE_SIZE)
    );

    const result = await listRecipientsPaginated({ page, pageSize, status });
    return NextResponse.json(result);
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
