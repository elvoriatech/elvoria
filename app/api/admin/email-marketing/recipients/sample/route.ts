import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAdminSession } from '@/lib/requireAdminSession';

export const runtime = 'nodejs';

const HEADERS = ['Business Name', 'Type / Branche', 'City', 'Country', 'Email', 'Notes / Website'];

const EXAMPLE_ROWS = [
  ['Schreinerei Muster GmbH', 'Schreinerei', 'Offenbach am Main', 'Germany', 'kontakt@muster-schreinerei.de', 'muster-schreinerei.de'],
  ['Malerbetrieb Beispiel', 'Malerbetrieb', 'Salzweg', 'Germany', 'info@beispiel-maler.de', 'beispiel-maler.de'],
  ['Salon Vorlage', 'Friseur/Kosmetik', 'Storkow', 'Germany', 'kontakt@salon-vorlage.de', 'salon-vorlage.de'],
];

/** Generates the recipient-import sample workbook on the fly (no static asset to lose). */
export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...EXAMPLE_ROWS]);
  sheet['!cols'] = [{ wch: 32 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 30 }, { wch: 24 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Recipients');

  const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="elvoria-recipients-sample.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}
