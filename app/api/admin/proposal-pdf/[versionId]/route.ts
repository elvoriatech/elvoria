import { NextRequest } from 'next/server';
import { getLogEntryByVersionId, readProposalPdfBytes } from '@/lib/crmStore';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { crmErrorResponse } from '@/lib/crmApiError';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/admin/proposal-pdf/[versionId]'>) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  try {
    const { versionId } = await ctx.params;
    const entry = await getLogEntryByVersionId(versionId);
    if (!entry) {
      return new Response('Not found', { status: 404 });
    }

    const data = await readProposalPdfBytes(versionId);
    if (!data) {
      return new Response('PDF not available', { status: 404 });
    }

    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="proposal-${versionId.slice(0, 8)}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const crm = crmErrorResponse(e);
    if (crm) return crm;
    throw e;
  }
}
