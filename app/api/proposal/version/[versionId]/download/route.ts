import fs from 'node:fs/promises';
import { NextRequest } from 'next/server';
import { proposalPdfPath } from '@/lib/localStore';
import { verifyDownloadToken } from '@/lib/pdfToken';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/proposal/version/[versionId]/download'>) {
  const { versionId } = await ctx.params;
  const url = new URL(_req.url);
  const token = url.searchParams.get('token') || '';

  if (!verifyDownloadToken(versionId, token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const filePath = proposalPdfPath(versionId);
  try {
    const data = await fs.readFile(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal-${versionId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

