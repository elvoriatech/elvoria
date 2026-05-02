import { NextResponse } from 'next/server';
import { dayRangeUtcForCalendarDate, listFreeSlots } from '@/lib/bookingAvailability';
import { createAdminClient, isBookingDatabaseConfigured } from '@/lib/supabaseAdmin';

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

  if (!isBookingDatabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      useEmailFallback: true,
      slots: [] as unknown[],
    });
  }

  try {
    const supabase = createAdminClient();
    const { dayStart, dayEnd } = dayRangeUtcForCalendarDate(date, timeZone);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .lt('start_time', dayEnd.toISOString())
      .gt('end_time', dayStart.toISOString());

    if (error) {
      console.error('availability query:', error);
      return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
    }

    const slots = listFreeSlots({
      date,
      timeZone,
      bookings: bookings ?? [],
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
