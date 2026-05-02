import { addDays } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export type SlotOption = { start: string; end: string; label: string };

function parseIntEnv(raw: string | undefined, fallback: number): number {
  const n = raw ? Number.parseInt(raw.trim(), 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/** Weekday (Mon–Fri) in `timeZone`, using noon on that calendar date to avoid DST edge cases. */
export function isWeekdayInZone(date: string, timeZone: string): boolean {
  const noon = fromZonedTime(`${date} 12:00:00`, timeZone);
  const isoDow = Number(formatInTimeZone(noon, timeZone, 'i')); // 1 Mon … 7 Sun
  return isoDow >= 1 && isoDow <= 5;
}

export function listFreeSlots(params: {
  date: string;
  timeZone: string;
  bookings: { start_time: string; end_time: string }[];
  now: Date;
  slotMinutes?: number;
  workStartHour?: number;
  workEndHour?: number;
}): SlotOption[] {
  const {
    date,
    timeZone,
    bookings,
    now,
    slotMinutes = parseIntEnv(process.env.BOOKING_SLOT_MINUTES, 30),
    workStartHour = parseIntEnv(process.env.BOOKING_DAY_START_HOUR, 9),
    workEndHour = parseIntEnv(process.env.BOOKING_DAY_END_HOUR, 18),
  } = params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  if (!isWeekdayInZone(date, timeZone)) return [];

  const booked = bookings.map((b) => ({
    s: new Date(b.start_time).getTime(),
    e: new Date(b.end_time).getTime(),
  }));

  const slotMs = slotMinutes * 60 * 1000;
  const slots: SlotOption[] = [];

  const workDayEndInstant = fromZonedTime(
    `${date} ${String(workEndHour).padStart(2, '0')}:00:00`,
    timeZone
  );
  const workDayEndMs = workDayEndInstant.getTime();

  for (let h = workStartHour; h < workEndHour; h++) {
    for (const m of [0, 30]) {
      const wall = `${date} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
      const startUtc = fromZonedTime(wall, timeZone);
      const endUtc = new Date(startUtc.getTime() + slotMs);
      const startMs = startUtc.getTime();
      const endMs = endUtc.getTime();

      if (endMs > workDayEndMs) continue;
      if (endMs <= now.getTime()) continue;

      const conflict = booked.some((b) => intervalsOverlap(startMs, endMs, b.s, b.e));
      if (conflict) continue;

      slots.push({
        start: startUtc.toISOString(),
        end: endUtc.toISOString(),
        label: formatInTimeZone(startUtc, timeZone, 'HH:mm'),
      });
    }
  }

  return slots;
}

export function dayRangeUtcForCalendarDate(date: string, timeZone: string): {
  dayStart: Date;
  dayEnd: Date;
} {
  const dayStart = fromZonedTime(`${date} 00:00:00`, timeZone);
  const noon = fromZonedTime(`${date} 12:00:00`, timeZone);
  const nextStr = formatInTimeZone(addDays(noon, 1), timeZone, 'yyyy-MM-dd');
  const dayEnd = fromZonedTime(`${nextStr} 00:00:00`, timeZone);
  return { dayStart, dayEnd };
}
