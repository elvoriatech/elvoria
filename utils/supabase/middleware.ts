import { NextRequest, NextResponse } from 'next/server';

/** No-op: Supabase session management removed; admin auth is handled via custom cookie. */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  return NextResponse.next({ request });
}
