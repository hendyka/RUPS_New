import fs from 'fs';
import path from 'path';

const MONTH_MAP: Record<string, string> = {
  januari: '01', jan: '01',
  februari: '02', feb: '02',
  maret: '03', mar: '03',
  april: '04', apr: '04',
  mei: '05', may: '05',
  juni: '06', jun: '06',
  juli: '07', jul: '07',
  agustus: '08', agu: '08', aug: '08',
  september: '09', sep: '09',
  oktober: '10', okt: '10', oct: '10',
  november: '11', nov: '11',
  desember: '12', des: '12', dec: '12',
};

function sync() {
  const rootDir = process.cwd();
  const csvPath = path.join(rootDir, 'public', 'libur-bursa.csv');
  const targetTsPath = path.join(rootDir, 'src', 'utils', 'holiday.ts');

  if (!fs.existsSync(csvPath)) {
    console.error(`[sync-holidays] Error: File tidak ditemukan di ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) {
    console.warn(`[sync-holidays] Warning: CSV kosong atau tidak memiliki data baris.`);
    return;
  }

  const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].toLowerCase().split(delimiter).map((s) => s.trim());
  const tglIdx = headers.indexOf('tgl');
  const bulanIdx = headers.indexOf('bulan');
  const tahunIdx = headers.indexOf('tahun');
  const ketIdx = headers.findIndex(
    (h) => h.includes('ket') || h.includes('nama') || h.includes('name') || h.includes('desk') || h.includes('libur')
  );

  const holidays: { date: string; name: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim());
    let parsedDate: string | null = null;
    let holidayName = 'Libur Bursa';

    if (tglIdx > -1 && bulanIdx > -1 && tahunIdx > -1 && cols[tglIdx] && cols[bulanIdx] && cols[tahunIdx]) {
      const day = String(cols[tglIdx]).padStart(2, '0');
      const monthStr = cols[bulanIdx].toLowerCase();
      const monthNum = MONTH_MAP[monthStr] || '01';
      const year = cols[tahunIdx];
      parsedDate = `${year}-${monthNum}-${day}`;
    } else {
      const match = lines[i].match(/\d{4}-\d{2}-\d{2}/);
      if (match) parsedDate = match[0];
    }

    if (ketIdx > -1 && cols[ketIdx]) {
      holidayName = cols[ketIdx].replace(/'/g, "\\'");
    }

    if (parsedDate && /^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
      if (!holidays.some((h) => h.date === parsedDate)) {
        holidays.push({ date: parsedDate, name: holidayName });
      }
    }
  }

  holidays.sort((a, b) => a.date.localeCompare(b.date));

  const generatedCode = `import { HolidayItem } from '../types';

/**
 * Data Hari Libur & Cuti Bersama Bursa.
 * File ini digenerate secara otomatis dari 'public/libur-bursa.csv'.
 *
 * Terakhir disinkronkan: ${new Date().toISOString()}
 * Total Hari Libur: ${holidays.length}
 *
 * Untuk memperbarui ulang file ini setelah mengubah public/libur-bursa.csv, jalankan:
 *   npm run sync-holidays
 */
export const DEFAULT_HOLIDAYS_2026: HolidayItem[] = [
${holidays.map((h) => `  { date: '${h.date}', name: '${h.name}' },`).join('\n')}
];
`;

  fs.writeFileSync(targetTsPath, generatedCode, 'utf-8');
  console.log(`[sync-holidays] Sukses menyinkronkan ${holidays.length} hari libur dari public/libur-bursa.csv ke ${targetTsPath}`);
}

sync();
