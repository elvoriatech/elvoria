import { NextResponse } from 'next/server';
import { CrmSchemaNotAppliedError } from '@/lib/crmSchemaError';
import { CrmNotConfiguredError } from '@/lib/crmStore';

export function crmErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof CrmNotConfiguredError) {
    return NextResponse.json({ error: err.message, code: 'CRM_NOT_CONFIGURED' }, { status: 503 });
  }
  if (err instanceof CrmSchemaNotAppliedError) {
    return NextResponse.json({ error: err.message, code: 'CRM_SCHEMA_MISSING' }, { status: 503 });
  }
  if (err instanceof Error && err.message.includes('DATA_ENCRYPTION_KEY')) {
    return NextResponse.json({ error: err.message, code: 'ENCRYPTION_NOT_CONFIGURED' }, { status: 503 });
  }
  return null;
}
