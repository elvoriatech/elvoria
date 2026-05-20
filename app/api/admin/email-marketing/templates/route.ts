import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { listTemplates, updateTemplate } from '@/lib/emailMarketing/store';
import type { EmailTemplateType } from '@/lib/emailMarketing/types';

const TYPES = new Set<EmailTemplateType>(['initial', 'follow_up_1', 'follow_up_2']);

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const templates = await listTemplates();
    return NextResponse.json({ templates });
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
    const templateType = body.templateType as EmailTemplateType;
    if (!TYPES.has(templateType)) {
      return NextResponse.json({ error: 'Invalid templateType' }, { status: 400 });
    }
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const bodyHtml = typeof body.bodyHtml === 'string' ? body.bodyHtml : '';
    if (!subject || !bodyHtml) {
      return NextResponse.json({ error: 'subject and bodyHtml are required' }, { status: 400 });
    }
    const template = await updateTemplate(templateType, { subject, bodyHtml });
    return NextResponse.json({ template });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
