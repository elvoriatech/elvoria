import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimitConfig = {
  /** Unique name (namespace) for the limiter. */
  name: string;
  /** Max requests per window. */
  limit: number;
  /** Window size in seconds. */
  windowSeconds: number;
};

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function getClientIp(req: NextRequest): string {
  const xfwd = req.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0]?.trim() || 'unknown';
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function limiter(config: LimitConfig) {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
    analytics: true,
    prefix: `elvoria:${config.name}`,
  });
}

export async function rateLimitOrThrow(params: {
  req: NextRequest;
  config: LimitConfig;
  /** Extra keying dimension (e.g. email). */
  keySuffix?: string;
}): Promise<NextResponse | null> {
  const rl = limiter(params.config);
  if (!rl) return null; // fail-open when Upstash is not configured

  const ip = getClientIp(params.req);
  const key = params.keySuffix ? `${ip}:${params.keySuffix}` : ip;
  const res = await rl.limit(key);
  if (res.success) return null;

  const retryAfter = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please wait and try again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(res.limit),
        'X-RateLimit-Remaining': String(res.remaining),
        'X-RateLimit-Reset': String(res.reset),
      },
    }
  );
}

