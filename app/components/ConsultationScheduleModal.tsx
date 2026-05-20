'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConsultationScheduleForm } from './ConsultationScheduleForm';

/** Global consultation booking dialog; opened via `elvoria:open-schedule` (see ScheduleConsultationTrigger). */
export function ConsultationScheduleModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('elvoria:open-schedule', onOpen);
    return () => window.removeEventListener('elvoria:open-schedule', onOpen);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Schedule a consultation"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl text-white">Schedule a free consultation</h3>
              <p className="mt-1 text-slate-400">
                Choose a date and time, or suggest a slot and we&apos;ll confirm by email.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>
          </div>

          <ConsultationScheduleForm
            enabled={open}
            variant="modal"
            showCancel
            onCancel={() => setOpen(false)}
            onSubmitted={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
