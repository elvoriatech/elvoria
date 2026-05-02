import fs from 'node:fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { proposalPdfPath } from '@/lib/localStore';
import { getLogEntryByVersionId, updateProposalFinalizeLogEntry } from '@/lib/proposalFinalizeLog';
import { sendProposalPdfToVisitorFromAdmin } from '@/lib/proposalPdfAdminDeliveryEmail';
import { requireAdminSession } from '@/lib/requireAdminSession';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { versionId?: string; to?: string };
  const versionId = String(body.versionId || '').trim();
  if (!versionId) {
    return NextResponse.json({ error: 'Missing versionId' }, { status: 400 });
  }

  const entry = await getLogEntryByVersionId(versionId);
  if (!entry) {
    return NextResponse.json({ error: 'Unknown proposal version' }, { status: 404 });
  }

  const toRaw = typeof body.to === 'string' ? body.to.trim().toLowerCase() : '';
  const to = toRaw || entry.visitorEmail.trim().toLowerCase();
  if (!to || !EMAIL_RE.test(to)) {
    return NextResponse.json(
      { error: 'Valid recipient email is required. Save a visitor email on the proposal or pass "to" in the request body.' },
      { status: 400 }
    );
  }

  const pdfPath = proposalPdfPath(versionId);
  try {
    await fs.access(pdfPath);
  } catch {
    return NextResponse.json({ error: 'PDF file not found on server' }, { status: 404 });
  }

  const r = await sendProposalPdfToVisitorFromAdmin({
    to,
    visitorName: entry.visitorName,
    pdfPath,
  });

  if (!r.sent) {
    const msg =
      r.reason === 'not_configured'
        ? 'Outbound email is not configured on this server'
        : r.detail || 'Failed to send email';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await updateProposalFinalizeLogEntry(versionId, {
    pdfEmailedByAdminAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, to });
}
