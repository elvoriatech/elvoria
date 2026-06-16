import { NextResponse } from 'next/server';
import { dayRangeUtcForCalendarDate, listFreeSlots } from '@/lib/bookingAvailability';
import { getPool, isDbConfigured } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date')?.trim() || '';
  const timeZone =
    searchParams.get('timeZone')?.trim() ||
    process.env.BOOKING_DEFAULT_TIMEZONE?.trim() ||
    'Europe/Berlin';

  if (!date) {
    return NextResponse.json({ error: 'Missing date (YYYY-MM-DD)' }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({
      configured: false,
      useEmailFallback: true,
      slots: [] as unknown[],
    });
  }

  try {
    const { dayStart, dayEnd } = dayRangeUtcForCalendarDate(date, timeZone);

    const { rows } = await getPool().query<{ start_time: string; end_time: string }>(
      `SELECT start_time, end_time FROM bookings
        WHERE start_time < $1 AND end_time > $2`,
      [dayEnd.toISOString(), dayStart.toISOString()]
    );

    const slots = listFreeSlots({
      date,
      timeZone,
      bookings: rows,
      now: new Date(),
    });

    return NextResponse.json({
      configured: true,
      useEmailFallback: false,
      date,
      timeZone,
      slots,
    });
  } catch (e) {
    console.error('availability:', e);
    return NextResponse.json({ error: 'Availability unavailable' }, { status: 500 });
  }
}
