import { NextResponse } from 'next/server';
import { createAdminClient, isBookingDatabaseConfigured } from '@/lib/supabaseAdmin';

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

export async function POST(req: Request) {
  if (!isBookingDatabaseConfigured()) {
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
    const supabase = createAdminClient();
    const { data: row, error: selErr } = await supabase
      .from('bookings')
      .select('id, email')
      .eq('id', id)
      .maybeSingle();

    if (selErr || !row) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (normalizeEmail(row.email) !== normalizeEmail(email)) {
      return NextResponse.json({ error: 'Email does not match this booking' }, { status: 403 });
    }

    const { error: delErr } = await supabase.from('bookings').delete().eq('id', id);
    if (delErr) {
      console.error('booking cancel:', delErr);
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('bookings cancel:', e);
    return NextResponse.json({ error: 'Cancel failed' }, { status: 500 });
  }
}
