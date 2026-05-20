import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getLogEntryByVersionId, readProposalPdfBytes, updateProposalFinalizeLogEntry } from '@/lib/crmStore';
import { sendProposalPdfToVisitorFromAdmin } from '@/lib/proposalPdfAdminDeliveryEmail';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { crmErrorResponse } from '@/lib/crmApiError';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  try {
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
        {
          error:
            'Valid recipient email is required. Save a visitor email on the proposal or pass "to" in the request body.',
        },
        { status: 400 }
      );
    }

    const pdfBytes = await readProposalPdfBytes(versionId);
    if (!pdfBytes) {
      return NextResponse.json({ error: 'PDF file not found in storage' }, { status: 404 });
    }

    const tmpPath = path.join(os.tmpdir(), `admin-send-${versionId}.pdf`);
    await fs.writeFile(tmpPath, pdfBytes);

    const r = await sendProposalPdfToVisitorFromAdmin({
      to,
      visitorName: entry.visitorName,
      pdfPath: tmpPath,
    });

    await fs.unlink(tmpPath).catch(() => undefined);

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
  } catch (e) {
    const crm = crmErrorResponse(e);
    if (crm) return crm;
    throw e;
  }
}
