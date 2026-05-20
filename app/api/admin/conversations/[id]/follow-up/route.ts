import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { crmErrorResponse } from '@/lib/crmApiError';
import { updateConversationFollowUp, type FollowUpStatus } from '@/lib/crmStore';

const STATUSES = new Set<FollowUpStatus>(['new', 'contacted', 'qualified', 'won', 'lost']);

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/conversations/[id]/follow-up'>
) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  try {
    const { id: conversationId } = await ctx.params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const patch: {
      followUpStatus?: FollowUpStatus;
      followUpNotes?: string;
      followUpNextAt?: string | null;
    } = {};

    if (typeof body.followUpStatus === 'string' && STATUSES.has(body.followUpStatus as FollowUpStatus)) {
      patch.followUpStatus = body.followUpStatus as FollowUpStatus;
    }
    if (typeof body.followUpNotes === 'string') {
      patch.followUpNotes = body.followUpNotes.slice(0, 8000);
    }
    if (body.followUpNextAt === null || body.followUpNextAt === '') {
      patch.followUpNextAt = null;
    } else if (typeof body.followUpNextAt === 'string') {
      const d = new Date(body.followUpNextAt);
      if (!Number.isNaN(d.getTime())) patch.followUpNextAt = d.toISOString();
    }

    const ok = await updateConversationFollowUp(conversationId, patch);
    if (!ok) {
      return NextResponse.json({ error: 'No lead linked to this conversation' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const crm = crmErrorResponse(e);
    if (crm) return crm;
    throw e;
  }
}
