'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ACTIVE_SEND_JOB_STORAGE_KEY,
  SEND_JOB_POLL_MS,
} from '@/lib/emailMarketing/constants';
import { notifyRecipientsChanged } from '@/lib/emailMarketing/recipientListEvents';
import type { EmailSendJob, EmailTemplateType, SendJobSelectionMode } from '@/lib/emailMarketing/types';

const ACTIVE: EmailSendJob['status'][] = ['queued', 'running'];

export function useSendJob() {
  const [job, setJob] = useState<EmailSendJob | null>(null);
  const [notSentCount, setNotSentCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshStatus = useCallback(async () => {
    const res = await fetch('/api/admin/email-marketing/jobs');
    const data = (await res.json()) as {
      active?: EmailSendJob | null;
      notSentCount?: number;
      error?: string;
    };
    if (!res.ok) throw new Error(data.error || 'Failed to load job status');
    setNotSentCount(data.notSentCount ?? 0);
    if (data.active) {
      setJob(data.active);
      sessionStorage.setItem(ACTIVE_SEND_JOB_STORAGE_KEY, data.active.id);
    }
    return data;
  }, []);

  const fetchJob = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/email-marketing/jobs/${id}`);
    const data = (await res.json()) as { job?: EmailSendJob; error?: string };
    if (!res.ok) throw new Error(data.error || 'Failed to load job');
    if (data.job) setJob(data.job);
    return data.job ?? null;
  }, []);

  const runProcessor = useCallback(async () => {
    await fetch('/api/admin/email-marketing/jobs/process', { method: 'POST' });
  }, []);

  const tick = useCallback(async () => {
    const id = job?.id ?? sessionStorage.getItem(ACTIVE_SEND_JOB_STORAGE_KEY);
    if (!id) return;
    try {
      await runProcessor();
      const updated = await fetchJob(id);
      if (updated && !ACTIVE.includes(updated.status)) {
        notifyRecipientsChanged();
        await refreshStatus();
        if (updated.status === 'completed') {
          setMessage(
            `Campaign complete — ${updated.sentCount.toLocaleString()} sent, ${updated.failedCount.toLocaleString()} failed of ${updated.totalCount.toLocaleString()} queued.`
          );
        } else if (updated.status === 'cancelled') {
          setMessage('Send job cancelled.');
        } else if (updated.status === 'failed') {
          setMessage(`Send job failed: ${updated.lastError || 'Unknown error'}`);
        }
        sessionStorage.removeItem(ACTIVE_SEND_JOB_STORAGE_KEY);
      }
    } catch {
      /* keep polling until job completes */
    }
  }, [job?.id, fetchJob, runProcessor, refreshStatus]);

  useEffect(() => {
    void refreshStatus().catch(() => {});
    const stored = sessionStorage.getItem(ACTIVE_SEND_JOB_STORAGE_KEY);
    if (stored) void fetchJob(stored).catch(() => {});
  }, [refreshStatus, fetchJob]);

  const isProcessing = job !== null && ACTIVE.includes(job.status);

  useEffect(() => {
    if (!isProcessing) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    void tick();
    tickRef.current = setInterval(() => void tick(), SEND_JOB_POLL_MS);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isProcessing, job?.id, tick]);

  async function startJob(params: {
    templateType: EmailTemplateType;
    autoFollowUp: boolean;
    selectionMode: SendJobSelectionMode;
    recipientIds?: string[];
  }) {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/email-marketing/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = (await res.json()) as { job?: EmailSendJob; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to queue send');
      if (!data.job) throw new Error('No job returned');
      setJob(data.job);
      sessionStorage.setItem(ACTIVE_SEND_JOB_STORAGE_KEY, data.job.id);
      setMessage(
        `Queued ${data.job.totalCount.toLocaleString()} emails — keep this tab open until the progress bar finishes.`
      );
      await runProcessor();
      await fetchJob(data.job.id);
    } finally {
      setBusy(false);
    }
  }

  async function cancelJob() {
    if (!job?.id) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/email-marketing/jobs/${job.id}`, { method: 'DELETE' });
      const data = (await res.json()) as { job?: EmailSendJob; error?: string };
      if (!res.ok) throw new Error(data.error || 'Cancel failed');
      setJob(data.job ?? null);
      setMessage('Send job cancelled.');
      sessionStorage.removeItem(ACTIVE_SEND_JOB_STORAGE_KEY);
      notifyRecipientsChanged();
    } finally {
      setBusy(false);
    }
  }

  const progressPercent =
    job && job.totalCount > 0 ? Math.min(100, Math.round((job.processedIndex / job.totalCount) * 100)) : 0;

  return {
    job,
    notSentCount,
    busy,
    message,
    setMessage,
    isProcessing,
    progressPercent,
    startJob,
    cancelJob,
    refreshStatus,
  };
}
