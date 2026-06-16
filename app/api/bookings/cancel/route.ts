import { NextResponse } from 'next/server';
import { getPool, isDbConfigured } from '@/lib/db';

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Bookings database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!id || !email) {
    return NextResponse.json({ error: 'Missing id or email' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query<{ id: string; email: string }>(
      'SELECT id, email FROM bookings WHERE id = $1 LIMIT 1',
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (normalizeEmail(rows[0].email) !== normalizeEmail(email)) {
      return NextResponse.json({ error: 'Email does not match this booking' }, { status: 403 });
    }

    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('bookings cancel:', e);
    return NextResponse.json({ error: 'Cancel failed' }, { status: 500 });
  }
}
