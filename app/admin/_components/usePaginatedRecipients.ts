'use client';

import { useCallback, useEffect, useState } from 'react';
import { RECIPIENTS_PAGE_SIZE } from '@/lib/emailMarketing/constants';
import type { EmailRecipient } from '@/lib/emailMarketing/types';

export type RecipientsPageResponse = {
  recipients: EmailRecipient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function usePaginatedRecipients() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<EmailRecipient[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        pageSize: String(RECIPIENTS_PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/email-marketing/recipients?${params}`);
      const data = (await res.json()) as RecipientsPageResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to load recipients');
      setRows(data.recipients);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (e) {
      setError((e as Error).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(page);
  }, [page, loadPage]);

  const refresh = useCallback(() => loadPage(page), [loadPage, page]);

  const rangeStart = total === 0 ? 0 : (page - 1) * RECIPIENTS_PAGE_SIZE + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * RECIPIENTS_PAGE_SIZE, total);

  return {
    page,
    setPage,
    rows,
    total,
    totalPages,
    loading,
    error,
    loadPage,
    refresh,
    rangeStart,
    rangeEnd,
    pageSize: RECIPIENTS_PAGE_SIZE,
  };
}

export async function fetchRecipientIdsByStatus(status: 'not_sent' | 'sent' | 'replied'): Promise<string[]> {
  const params = new URLSearchParams({ idsOnly: 'true', status });
  const res = await fetch(`/api/admin/email-marketing/recipients?${params}`);
  const data = (await res.json()) as { ids?: string[]; error?: string };
  if (!res.ok) throw new Error(data.error || 'Failed to load recipient IDs');
  return data.ids ?? [];
}
