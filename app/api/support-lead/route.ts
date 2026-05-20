import { NextRequest, NextResponse } from 'next/server';
import { appendSupportLead, CrmNotConfiguredError, type SupportLeadSource } from '@/lib/supportLeads';
import { crmErrorResponse } from '@/lib/crmApiError';
import { isVisitorAutoReplyEnabled, sendSupportLeadAutoReply } from '@/lib/visitorAckEmail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_SOURCES = new Set<SupportLeadSource>([
  'proposal_widget',
  'contact_technical_proposal',
  'hero_start_project',
  'hero_build_together',
  'contact_start_project',
]);

function trimStr(s: unknown, max: number): string {
  const t = typeof s === 'string' ? s.trim() : '';
  if (t.length > max) return t.slice(0, max);
  return t;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const fullName = trimStr(body.fullName, 120);
    const email = trimStr(body.email, 254).toLowerCase();
    const company = trimStr(body.company, 200);
    const phone = trimStr(body.phone, 60);
    const conversationId = trimStr(body.conversationId, 64);
    const rawSource = typeof body.source === 'string' ? body.source : '';
    const source: SupportLeadSource = VALID_SOURCES.has(rawSource as SupportLeadSource)
      ? (rawSource as SupportLeadSource)
      : 'proposal_widget';

    if (!conversationId || !UUID_RE.test(conversationId)) {
      return NextResponse.json({ error: 'Valid conversationId is required' }, { status: 400 });
    }
    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!company) {
      return NextResponse.json({ error: 'Company is required' }, { status: 400 });
    }

    await appendSupportLead({
      conversationId,
      source,
      fullName,
      email,
      company,
      phone: phone || '',
    });

    let autoReplySent = false;
    let autoReplyError: string | undefined;
    const sendAutoReply = isVisitorAutoReplyEnabled();
    if (sendAutoReply) {
      try {
        const auto = await sendSupportLeadAutoReply({ fullName, email, company });
        autoReplySent = auto.sent;
        if (!auto.sent && !auto.skipped) autoReplyError = auto.detail;
      } catch (err) {
        console.error('[support-lead] auto-reply:', err);
        autoReplyError = err instanceof Error ? err.message : 'Auto-reply failed';
      }
    }

    return NextResponse.json({
      ok: true,
      conversationId,
      autoReplyEnabled: sendAutoReply,
      autoReplySent,
      autoReplyError,
    });
  } catch (e) {
    const crm = crmErrorResponse(e);
    if (crm) return crm;
    if (e instanceof CrmNotConfiguredError) {
      return NextResponse.json({ error: e.message, code: 'CRM_NOT_CONFIGURED' }, { status: 503 });
    }
    console.error('[support-lead]', e);
    return NextResponse.json({ error: 'Could not save your details' }, { status: 500 });
  }
}
