import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { recordPageView } from '@/lib/siteAnalyticsStore';

const COOKIE = 'et_visitor_id';
const MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { path?: string };
    const path = typeof body.path === 'string' ? body.path : '/';

    let visitorId = request.cookies.get(COOKIE)?.value;
    const setCookie = !visitorId;
    if (!visitorId) visitorId = randomUUID();

    await recordPageView(visitorId, path);

    const res = NextResponse.json({ ok: true });
    if (setCookie) {
      res.cookies.set(COOKIE, visitorId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: MAX_AGE,
        path: '/',
      });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
