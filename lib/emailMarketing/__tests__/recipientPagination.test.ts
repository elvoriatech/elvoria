import { RECIPIENTS_PAGE_SIZE } from '@/lib/emailMarketing/constants';

describe('recipient pagination constants', () => {
  it('uses 500 rows per admin page', () => {
    expect(RECIPIENTS_PAGE_SIZE).toBe(500);
  });
});

describe('pagination range math', () => {
  function rangeStart(page: number, pageSize: number) {
    return (page - 1) * pageSize + 1;
  }

  function rangeEnd(page: number, pageSize: number, total: number) {
    return Math.min(page * pageSize, total);
  }

  it('computes first page range', () => {
    expect(rangeStart(1, 500)).toBe(1);
    expect(rangeEnd(1, 500, 2341)).toBe(500);
  });

  it('computes last partial page range', () => {
    expect(rangeStart(5, 500)).toBe(2001);
    expect(rangeEnd(5, 500, 2341)).toBe(2341);
  });
});
