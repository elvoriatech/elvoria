import fs from 'node:fs/promises';
import { NextRequest } from 'next/server';
import { proposalPdfPath } from '@/lib/localStore';
import { getLogEntryByVersionId } from '@/lib/proposalFinalizeLog';
import { requireAdminSession } from '@/lib/requireAdminSession';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/admin/proposal-pdf/[versionId]'>) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const { versionId } = await ctx.params;
  const entry = await getLogEntryByVersionId(versionId);
  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  const filePath = proposalPdfPath(versionId);
  try {
    const data = await fs.readFile(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="proposal-${versionId.slice(0, 8)}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response('PDF not available', { status: 404 });
  }
}
