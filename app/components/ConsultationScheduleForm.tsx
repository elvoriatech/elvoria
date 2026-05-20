'use client';

import { CircleCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

type ScheduleSlot = { start: string; end: string; label: string };

const inputModal =
  'w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none';
const inputInline =
  'w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-[#06B6D4] focus:outline-none dark:border-slate-700 dark:bg-[#0F172A] dark:text-[#F8FAFC]';

type Props = {
  /** When false, skips availability fetch (e.g. closed modal). */
  enabled?: boolean;
  variant?: 'inline' | 'modal';
  showCancel?: boolean;
  onCancel?: () => void;
  onSubmitted?: () => void;
};

export function ConsultationScheduleForm({
  enabled = true,
  variant = 'inline',
  showCancel = false,
  onCancel,
  onSubmitted,
}: Props) {
  const isModal = variant === 'modal';
  const inputClass = isModal ? inputModal : inputInline;
  const labelClass = isModal ? 'mb-2 block text-sm text-slate-300' : 'mb-2 block text-sm font-semibold text-foreground dark:text-slate-300';

  const [data, setData] = useState({
    name: '',
    email: '',
    company: '',
    preferredDate: '',
    preferredTime: '',
    timeZone:
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || ''
        : '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [bookingMode, setBookingMode] = useState<'unknown' | 'slots' | 'email'>('unknown');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setBookingMode('unknown');
    setSelectedSlot(null);
    setSlots([]);
    setData((prev) => {
      if (prev.preferredDate) return prev;
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      return {
        ...prev,
        preferredDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      };
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !data.preferredDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    const tz = data.timeZone?.trim() || 'Europe/Berlin';
    const params = new URLSearchParams({ date: data.preferredDate, timeZone: tz });

    (async () => {
      try {
        const res = await fetch(`/api/availability?${params}`);
        const json = (await res.json()) as {
          useEmailFallback?: boolean;
          slots?: ScheduleSlot[];
        };
        if (cancelled) return;
        if (json.useEmailFallback) {
          setBookingMode('email');
          setSlots([]);
        } else {
          setBookingMode('slots');
          setSlots(Array.isArray(json.slots) ? json.slots : []);
        }
        setSelectedSlot(null);
      } catch {
        if (!cancelled) {
          setBookingMode('email');
          setSlots([]);
          setSelectedSlot(null);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, data.preferredDate, data.timeZone]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  function handleSlotSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const start = e.target.value;
    if (!start) {
      setSelectedSlot(null);
      return;
    }
    const slot = slots.find((s) => s.start === start) ?? null;
    setSelectedSlot(slot);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (bookingMode === 'slots') {
        if (!selectedSlot) {
          setError('Please choose an available time slot.');
          return;
        }
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            company: data.company,
            notes: data.notes,
            startTime: selectedSlot.start,
            endTime: selectedSlot.end,
            timeZone: data.timeZone || 'Europe/Berlin',
            meetingTypeSlug: 'consultation',
          }),
        });

        if (response.status === 409) {
          setError('That time was just taken. Pick another slot.');
          const tz = data.timeZone?.trim() || 'Europe/Berlin';
          const params = new URLSearchParams({ date: data.preferredDate, timeZone: tz });
          const r2 = await fetch(`/api/availability?${params}`);
          const j2 = (await r2.json()) as { slots?: ScheduleSlot[] };
          setSlots(Array.isArray(j2.slots) ? j2.slots : []);
          setSelectedSlot(null);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Could not complete booking');
        }

        setSubmitted(true);
        setData((prev) => ({ ...prev, preferredDate: '', preferredTime: '', notes: '' }));
        setSelectedSlot(null);
        setTimeout(() => {
          setSubmitted(false);
          onSubmitted?.();
        }, 2500);
        return;
      }

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send scheduling request');
      }

      setSubmitted(true);
      setData((prev) => ({ ...prev, preferredDate: '', preferredTime: '', notes: '' }));
      setTimeout(() => {
        setSubmitted(false);
        onSubmitted?.();
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const hintClass = isModal ? 'text-slate-400' : 'text-muted-foreground dark:text-slate-400';
  const errorClass = isModal
    ? 'mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300'
    : 'mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300';
  const successClass = isModal
    ? 'mb-6 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300'
    : 'mb-4 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-300';

  return (
    <>
      {submitted && (
        <div className={successClass}>
          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500 dark:text-green-400" strokeWidth={2} aria-hidden />
          <span>Request sent! We&apos;ll confirm shortly.</span>
        </div>
      )}

      {error && <div className={errorClass}>{error}</div>}

      {!isModal && (
        <p className={`mb-5 text-sm ${hintClass}`}>
          {bookingMode === 'slots'
            ? 'Choose a date, then pick a 30-minute slot (Mon–Fri, business hours).'
            : 'Pick a preferred time and we’ll email you to confirm.'}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              required
              placeholder="john@company.com"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Company</label>
          <input
            type="text"
            name="company"
            value={data.company}
            onChange={handleChange}
            placeholder="Your Company"
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="consultation-date">
              Date *
            </label>
            <input
              id="consultation-date"
              type="date"
              name="preferredDate"
              value={data.preferredDate}
              onChange={handleChange}
              min={(() => {
                const d = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
              })()}
              required
              className={inputClass}
            />
          </div>

          {bookingMode === 'email' ? (
            <div>
              <label className={labelClass} htmlFor="consultation-time">
                Time *
              </label>
              <input
                id="consultation-time"
                type="time"
                name="preferredTime"
                value={data.preferredTime}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="consultation-slot">
                Available times *
              </label>
              {slotsLoading || bookingMode === 'unknown' ? (
                <select
                  id="consultation-slot"
                  disabled
                  className={`${inputClass} cursor-wait opacity-70`}
                  aria-busy="true"
                >
                  <option>Loading available times…</option>
                </select>
              ) : bookingMode === 'slots' && slots.length === 0 ? (
                <div className="space-y-2">
                  <select id="consultation-slot" disabled className={`${inputClass} opacity-70`}>
                    <option>No openings on this day</option>
                  </select>
                  <p className={`text-sm ${hintClass}`}>
                    Choose another weekday (Mon–Fri) or adjust your time zone.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingMode('email');
                      setSelectedSlot(null);
                    }}
                    className="text-sm font-medium text-[#06B6D4] underline-offset-2 hover:text-[#22d3ee] hover:underline"
                  >
                    Suggest a time by email instead
                  </button>
                </div>
              ) : bookingMode === 'slots' ? (
                <select
                  id="consultation-slot"
                  value={selectedSlot?.start ?? ''}
                  onChange={handleSlotSelect}
                  required
                  className={inputClass}
                >
                  <option value="">Select a time</option>
                  {slots.map((slot) => (
                    <option key={slot.start} value={slot.start}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="consultation-timezone">
              Time zone
            </label>
            <input
              id="consultation-timezone"
              type="text"
              name="timeZone"
              value={data.timeZone}
              onChange={handleChange}
              placeholder="e.g. Europe/Berlin"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            rows={4}
            value={data.notes}
            onChange={handleChange}
            placeholder="What would you like to discuss?"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={
              loading ||
              slotsLoading ||
              bookingMode === 'unknown' ||
              (bookingMode === 'slots' && (!slots.length || !selectedSlot))
            }
            className={
              isModal
                ? 'flex-1 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-50'
                : 'flex-1 rounded-lg bg-linear-to-r from-[#06B6D4] to-[#3B82F6] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#06B6D4]/30 disabled:cursor-not-allowed disabled:opacity-50'
            }
          >
            {loading
              ? 'Sending...'
              : bookingMode === 'slots'
                ? 'Confirm booking'
                : 'Request consultation time'}
          </button>
          {showCancel && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className={
                isModal
                  ? 'flex-1 rounded-lg border border-slate-500 bg-slate-800 px-6 py-3 font-semibold text-slate-100 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-700'
                  : 'flex-1 rounded-lg border border-border/80 bg-muted px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
              }
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}
