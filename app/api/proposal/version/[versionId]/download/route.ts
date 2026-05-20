import { NextRequest } from 'next/server';
import { readProposalPdfBytes } from '@/lib/crmStore';
import { verifyDownloadToken } from '@/lib/pdfToken';
import { crmErrorResponse } from '@/lib/crmApiError';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/proposal/version/[versionId]/download'>) {
  const { versionId } = await ctx.params;
  const url = new URL(_req.url);
  const token = url.searchParams.get('token') || '';

  if (!verifyDownloadToken(versionId, token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const data = await readProposalPdfBytes(versionId);
    if (!data) {
      return new Response('Not found', { status: 404 });
    }
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal-${versionId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const crm = crmErrorResponse(e);
    if (crm) return crm;
    throw e;
  }
}
