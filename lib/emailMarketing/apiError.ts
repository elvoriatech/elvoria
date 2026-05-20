import { NextResponse } from 'next/server';
import {
  EmailMarketingNotConfiguredError,
  EmailMarketingSchemaNotAppliedError,
} from '@/lib/emailMarketing/store';

export function emailMarketingErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof EmailMarketingNotConfiguredError) {
    return NextResponse.json({ error: err.message, code: 'EMAIL_MKT_NOT_CONFIGURED' }, { status: 503 });
  }
  if (err instanceof EmailMarketingSchemaNotAppliedError) {
    return NextResponse.json({ error: err.message, code: 'EMAIL_MKT_SCHEMA_MISSING' }, { status: 503 });
  }
  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  return null;
}
