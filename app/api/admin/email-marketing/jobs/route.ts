import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { countRecipientsByStatus } from '@/lib/emailMarketing/store';
import { createSendJob, getActiveSendJob } from '@/lib/emailMarketing/jobs';
import type { EmailTemplateType, SendJobSelectionMode } from '@/lib/emailMarketing/types';

const TYPES = new Set<EmailTemplateType>(['initial', 'follow_up_1', 'follow_up_2']);
const MODES = new Set<SendJobSelectionMode>(['all_not_sent', 'recipient_ids']);

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const [active, notSentCount] = await Promise.all([
      getActiveSendJob(),
      countRecipientsByStatus('not_sent'),
    ]);
    return NextResponse.json({ active, notSentCount });
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
    const templateType = body.templateType as EmailTemplateType;
    if (!TYPES.has(templateType)) {
      return NextResponse.json({ error: 'Invalid templateType' }, { status: 400 });
    }
    const selectionMode = (body.selectionMode as SendJobSelectionMode) || 'recipient_ids';
    if (!MODES.has(selectionMode)) {
      return NextResponse.json({ error: 'Invalid selectionMode' }, { status: 400 });
    }
    const recipientIds = Array.isArray(body.recipientIds)
      ? body.recipientIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [];
    if (selectionMode === 'recipient_ids' && !recipientIds.length) {
      return NextResponse.json({ error: 'Select at least one recipient' }, { status: 400 });
    }
    const autoFollowUp = body.autoFollowUp === true;

    const job = await createSendJob({
      templateType,
      autoFollowUp,
      selectionMode,
      recipientIds: selectionMode === 'recipient_ids' ? recipientIds : undefined,
    });
    return NextResponse.json({ job });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create job';
    if (msg.includes('already in progress')) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
