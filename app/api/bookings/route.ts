import { formatInTimeZone } from 'date-fns-tz';
import { NextResponse } from 'next/server';
import { sendConsultationEmails } from '@/lib/consultationEmail';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { createAdminClient, isBookingDatabaseConfigured } from '@/lib/supabaseAdmin';

const DEFAULT_SLUG = 'consultation';

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  if (!isBookingDatabaseConfigured()) {
    return NextResponse.json({ error: 'Bookings database not configured' }, { status: 503 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('id, name, email, company, notes, start_time, end_time, created_at, meeting_type_id')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('bookings list:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data ?? [] });
  } catch (e) {
    console.error('bookings GET:', e);
    return NextResponse.json({ error: 'Failed to list bookings' }, { status: 500 });
  }
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
    const supabase = createAdminClient();

    const { data: mt, error: mtErr } = await supabase
      .from('meeting_types')
      .select('id, duration_minutes')
      .eq('slug', meetingTypeSlug)
      .maybeSingle();

    if (mtErr || !mt) {
      return NextResponse.json({ error: 'Unknown meeting type' }, { status: 400 });
    }

    const expectedMs = mt.duration_minutes * 60 * 1000;
    if (Math.abs(endMs - startMs - expectedMs) > 2000) {
      return NextResponse.json(
        { error: `Slot must be exactly ${mt.duration_minutes} minutes` },
        { status: 400 }
      );
    }

    const { data: rpcData, error: rpcErr } = await supabase.rpc('book_consultation', {
      p_meeting_slug: meetingTypeSlug,
      p_name: name,
      p_email: normalizeEmail(email),
      p_start: new Date(startMs).toISOString(),
      p_end: new Date(endMs).toISOString(),
      p_company: company || null,
      p_notes: notes || null,
    });

    if (rpcErr) {
      console.error('book_consultation:', rpcErr);
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    const row = rpcData as { ok?: boolean; error?: string; booking?: { id: string } } | null;
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
        await supabase.from('bookings').delete().eq('id', bookingId);
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
