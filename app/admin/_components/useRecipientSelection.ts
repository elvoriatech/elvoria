'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  clearStoredRecipientSelection,
  loadStoredRecipientSelection,
  saveStoredRecipientSelection,
} from '@/lib/emailMarketing/recipientSelectionStorage';

type Mode = 'companies' | 'campaigns';

/**
 * Selection starts empty on every page load/refresh.
 * Restores from sessionStorage only when opening Campaigns via
 * Companies → “Send campaign with N selected” (?importSelection=1).
 */
export function useRecipientSelection(mode: Mode) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [importedFromCompanies, setImportedFromCompanies] = useState(false);

  useEffect(() => {
    if (mode !== 'campaigns') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('importSelection') !== '1') return;

    setSelected(loadStoredRecipientSelection());
    setImportedFromCompanies(true);
    params.delete('importSelection');
    const qs = params.toString();
    const path = window.location.pathname;
    window.history.replaceState({}, '', qs ? `${path}?${qs}` : path);
  }, [mode]);

  useEffect(() => {
    saveStoredRecipientSelection(selected);
  }, [selected]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
    clearStoredRecipientSelection();
    setImportedFromCompanies(false);
  }, []);

  return { selected, setSelected, clearSelection, importedFromCompanies };
}
