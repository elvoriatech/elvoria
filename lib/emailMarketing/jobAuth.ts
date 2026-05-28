import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';

/** Cron worker or logged-in admin may run job processor. */
export async function requireJobProcessorAuth(request: NextRequest): Promise<NextResponse | null> {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) return null;

  return requireAdminSession();
}
