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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

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
          <div className="sm:col-span-1">
            <label className={labelClass}>Date *</label>
            <input
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
            <div className="sm:col-span-1">
              <label className={labelClass}>Time *</label>
              <input
                type="time"
                name="preferredTime"
                value={data.preferredTime}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          ) : (
            <div className="min-h-12 sm:col-span-2">
              {slotsLoading || bookingMode === 'unknown' ? (
                <p className={`pt-8 text-sm ${hintClass} sm:pt-10`}>Loading available times…</p>
              ) : bookingMode === 'slots' ? (
                <div>
                  <div className={labelClass}>Available times *</div>
                  {slots.length === 0 ? (
                    <div className="space-y-2">
                      <p className={`text-sm ${hintClass}`}>
                        No 30-minute openings on this day. Choose another weekday (Mon–Fri) or adjust your time zone.
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
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => {
                        const active = selectedSlot?.start === slot.start;
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                              active
                                ? 'border-[#06B6D4] bg-[#06B6D4]/20 text-foreground dark:text-[#F8FAFC]'
                                : isModal
                                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-[#06B6D4]/60'
                                  : 'border-border/60 bg-background text-foreground hover:border-[#06B6D4]/60 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200'
                            }`}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
          <div className={bookingMode === 'email' ? 'sm:col-span-1' : 'sm:col-span-3 sm:max-w-md'}>
            <label className={labelClass}>Time zone</label>
            <input
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
                ? 'flex-1 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 px-6 py-3 transition-all hover:shadow-lg hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-50'
                : 'flex-1 rounded-lg bg-linear-to-r from-[#06B6D4] to-[#3B82F6] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#06B6D4]/30 disabled:cursor-not-allowed disabled:opacity-50'
            }
          >
            {loading
              ? 'Sending...'
              : bookingMode === 'slots'
                ? 'Confirm booking'
                : 'Request consultation time'}
          </button>
          {showCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-6 py-3 transition-colors hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}
