import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emailMarketingErrorResponse } from '@/lib/emailMarketing/apiError';
import { resetTemplateToDefault } from '@/lib/emailMarketing/store';
import type { EmailTemplateType } from '@/lib/emailMarketing/types';

const TYPES = new Set<EmailTemplateType>(['initial', 'follow_up_1', 'follow_up_2']);

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const templateType = body.templateType as EmailTemplateType;
    if (!TYPES.has(templateType)) {
      return NextResponse.json({ error: 'Invalid templateType' }, { status: 400 });
    }
    const template = await resetTemplateToDefault(templateType);
    return NextResponse.json({ template, reset: true });
  } catch (e) {
    const r = emailMarketingErrorResponse(e);
    if (r) return r;
    throw e;
  }
}
