import { formatInTimeZone } from 'date-fns-tz';
import { NextResponse } from 'next/server';
import { sendConsultationEmails } from '@/lib/consultationEmail';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { getPool, isDbConfigured } from '@/lib/db';

const DEFAULT_SLUG = 'consultation';

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Bookings database not configured' }, { status: 503 });
  }

  try {
    const { rows } = await getPool().query(
      `SELECT id, name, email, company, notes, start_time, end_time, created_at, meeting_type_id
         FROM bookings
        ORDER BY start_time ASC`
    );
    return NextResponse.json({ bookings: rows });
  } catch (e) {
    console.error('bookings GET:', e);
    return NextResponse.json({ error: 'Failed to list bookings' }, { status: 500 });
  }
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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const startTime = typeof body.startTime === 'string' ? body.startTime.trim() : '';
  const endTime = typeof body.endTime === 'string' ? body.endTime.trim() : '';
  const meetingTypeSlug =
    typeof body.meetingTypeSlug === 'string' && body.meetingTypeSlug.trim()
      ? body.meetingTypeSlug.trim()
      : DEFAULT_SLUG;
  const timeZone =
    typeof body.timeZone === 'string' && body.timeZone.trim()
      ? body.timeZone.trim()
      : process.env.BOOKING_DEFAULT_TIMEZONE?.trim() || 'Europe/Berlin';

  if (!name || !email || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing name, email, startTime, or endTime' }, { status: 400 });
  }

  const startMs = Date.parse(startTime);
  const endMs = Date.parse(endTime);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return NextResponse.json({ error: 'Invalid start or end time' }, { status: 400 });
  }

  try {
    const pool = getPool();

    const { rows: mtRows } = await pool.query<{ id: string; duration_minutes: number }>(
      'SELECT id, duration_minutes FROM meeting_types WHERE slug = $1 LIMIT 1',
      [meetingTypeSlug]
    );
    if (!mtRows.length) {
      return NextResponse.json({ error: 'Unknown meeting type' }, { status: 400 });
    }
    const mt = mtRows[0];

    const expectedMs = mt.duration_minutes * 60 * 1000;
    if (Math.abs(endMs - startMs - expectedMs) > 2000) {
      return NextResponse.json(
        { error: `Slot must be exactly ${mt.duration_minutes} minutes` },
        { status: 400 }
      );
    }

    const { rows: rpcRows } = await pool.query<{ book_consultation: { ok: boolean; error?: string; booking?: { id: string } } }>(
      `SELECT book_consultation($1, $2, $3, $4, $5, $6, $7) AS book_consultation`,
      [
        meetingTypeSlug,
        name,
        normalizeEmail(email),
        new Date(startMs).toISOString(),
        new Date(endMs).toISOString(),
        company || null,
        notes || null,
      ]
    );

    const row = rpcRows[0]?.book_consultation ?? null;
    if (!row?.ok) {
      if (row?.error === 'conflict') {
        return NextResponse.json({ error: 'Time slot already booked' }, { status: 409 });
      }
      return NextResponse.json({ error: row?.error || 'Booking failed' }, { status: 400 });
    }

    const bookingId = row.booking?.id;
    const startDate = new Date(startMs);
    const whenDisplay = `${formatInTimeZone(startDate, timeZone, 'yyyy-MM-dd HH:mm')} (${timeZone})`;

    try {
      await sendConsultationEmails({
        name,
        email,
        company: company || undefined,
        whenDisplay,
        notes: notes || undefined,
      });
    } catch (mailErr) {
      console.error('Booking email failed:', mailErr);
      if (bookingId) {
        await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
      }
      return NextResponse.json(
        { error: 'Could not send confirmation email. Booking was not saved. Try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, booking: row.booking });
  } catch (e) {
    console.error('bookings POST:', e);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}
