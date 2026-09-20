import { CategoryType, HolidayItem, TimelineItem } from '../types';

export const DEFAULT_HOLIDAYS_2026: HolidayItem[] = [
  { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi' },
  { date: '2026-01-16', name: 'Isra Mikraj Nabi Muhammad SAW' },
  { date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek 2577' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
  { date: '2026-03-18', name: 'Cuti Bersama Hari Suci Nyepi' },
  { date: '2026-03-19', name: 'Hari Suci Nyepi Tahun Baru Saka 1948' },
  { date: '2026-03-20', name: 'Cuti Bersama Idul Fitri 1447 H' },
  { date: '2026-03-23', name: 'Cuti Bersama Idul Fitri 1447 H' },
  { date: '2026-03-24', name: 'Cuti Bersama Idul Fitri 1447 H' },
  { date: '2026-04-03', name: 'Wafat Yesus Kristus' },
  { date: '2026-05-01', name: 'Hari Buruh Internasional' },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
  { date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus' },
  { date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H' },
  { date: '2026-05-28', name: 'Cuti Bersama Idul Adha 1447 H' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2026-06-16', name: 'Tahun Baru Islam 1448 Hijriah' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan RI' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2026-12-24', name: 'Cuti Bersama Kelahiran Yesus Kristus' },
  { date: '2026-12-25', name: 'Kelahiran Yesus Kristus' },
  { date: '2026-12-31', name: 'Libur Tutup Tahun Bursa BEI' },
];

export const MONTH_MAP: Record<string, string> = {
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

// Safe date parsing to midday to avoid timezone offset glitches
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

// Format date to YYYY-MM-DD
export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Add calendar days
export function addCalendarDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateIso(d);
}

// Check if a date is a weekend (Sat/Sun) or in holiday list
export function isWeekendOrHoliday(date: Date, holidayDates: string[]): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  return holidayDates.includes(formatDateIso(date));
}

// Add/subtract business/trading days
export function addWorkDays(dateStr: string, workDays: number, holidayDates: string[]): string {
  const current = parseDate(dateStr);
  let count = 0;
  const direction = workDays > 0 ? 1 : -1;
  const target = Math.abs(workDays);

  if (target === 0) {
    while (isWeekendOrHoliday(current, holidayDates)) {
      current.setDate(current.getDate() + 1);
    }
    return formatDateIso(current);
  }

  while (count < target) {
    current.setDate(current.getDate() + direction);
    if (!isWeekendOrHoliday(current, holidayDates)) {
      count++;
    }
  }

  return formatDateIso(current);
}

// Indonesian localized date format (e.g. "Senin, 11 Mei 2026")
export function formatDateIndonesian(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Indonesian short format (e.g. "11 Mei 2026")
export function formatDateIndonesianShort(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Calculate days difference from today
export function getDaysDiffFromToday(dateStr: string): number {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const target = parseDate(dateStr);
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate the earliest possible RUPS date based on notification date to OJK/BEI
export function calculateEarliestRupsDate(notificationDate: string, holidayDates: string[]): string | null {
  if (!notificationDate) return null;
  let testDate = addWorkDays(addCalendarDays(notificationDate, 35), 1, holidayDates);
  for (let i = 0; i < 40; i++) {
    const pemanggilan = addWorkDays(addCalendarDays(testDate, -21), -1, holidayDates);
    const pengumuman = addWorkDays(addCalendarDays(pemanggilan, -14), -1, holidayDates);
    const suratOjk = addWorkDays(pengumuman, -5, holidayDates);

    if (parseDate(suratOjk).getTime() >= parseDate(notificationDate).getTime()) {
      return testDate;
    }
    testDate = addWorkDays(testDate, 1, holidayDates);
  }
  return null;
}

// Generate the complete RUPS timeline items
export function calculateRupsTimeline(rupsDate: string, holidayDates: string[]): TimelineItem[] {
  if (!rupsDate) return [];

  const n = rupsDate;
  // Pra-RUPS
  const pemanggilan = addWorkDays(addCalendarDays(n, -21), -1, holidayDates);
  const pengumuman = addWorkDays(addCalendarDays(pemanggilan, -14), -1, holidayDates);
  const suratOjk = addWorkDays(pengumuman, -5, holidayDates);
  const batasUsulanAgenda = addWorkDays(addCalendarDays(pemanggilan, -6), -1, holidayDates);
  const recordingDateRups = addWorkDays(pemanggilan, -1, holidayDates);

  // Pasca-RUPS
  const ringkasanRisalah = addWorkDays(n, 2, holidayDates);
  const risalahLengkap = addWorkDays(addCalendarDays(n, 29), 1, holidayDates);

  // Dividen
  const recordingDateDividen = addWorkDays(n, 8, holidayDates);
  const cumReguler = addWorkDays(recordingDateDividen, -2, holidayDates);
  const exReguler = addWorkDays(cumReguler, 1, holidayDates);
  const cumTunai = recordingDateDividen;
  const exTunai = addWorkDays(cumTunai, 1, holidayDates);
  const pembayaranDividen = addWorkDays(ringkasanRisalah, 30, holidayDates);

  const items: TimelineItem[] = [
    {
      id: 'pra-1',
      date: suratOjk,
      title: 'Surat Pemberitahuan Rencana RUPS kepada OJK dan BEI',
      desc: 'Paling lambat 5 hari kerja bursa sebelum pengumuman RUPS.',
      category: 'pra',
      legalBasis: 'POJK No. 15/POJK.04/2020 Pasal 14 ayat (1) & POJK No. 14 Tahun 2025',
      notes: 'Wajib memuat mata acara rapat dan penjelasan singkat.'
    },
    {
      id: 'pra-2',
      date: pengumuman,
      title: 'Pengumuman RUPS (Website IDX, KSEI, & Perseroan)',
      desc: 'Paling lambat 14 hari kalender sebelum pemanggilan, tidak memperhitungkan tanggal pengumuman dan pemanggilan.',
      category: 'pra',
      legalBasis: 'POJK No. 15/POJK.04/2020 Pasal 16 ayat (1)',
      notes: 'Pengumuman melalui situs web BEI, KSEI (eASY.KSEI), dan situs resmi Perseroan.'
    },
    {
      id: 'pra-3',
      date: batasUsulanAgenda,
      title: 'Batas Akhir Penerimaan Usulan Tambahan Agenda RUPS',
      desc: 'Paling lambat 7 hari kalender sebelum tanggal pemanggilan RUPS.',
      category: 'pra',
      legalBasis: 'POJK No. 15/POJK.04/2020 Pasal 16 ayat (2)',
      notes: 'Oleh 1 atau lebih pemegang saham yang mewakili minimal 1/20 dari jumlah seluruh saham dengan hak suara.'
    },
    {
      id: 'pra-4',
      date: recordingDateRups,
      title: 'Recording Date RUPS (Daftar Pemegang Saham yang Berhak Hadir)',
      desc: 'Paling lambat 1 hari kerja bursa sebelum tanggal pemanggilan RUPS.',
      category: 'pra',
      legalBasis: 'POJK No. 15/POJK.04/2020 Pasal 19 ayat (2)',
      notes: 'Pemegang saham yang namanya tercatat dalam DPS Perseroan pada pukul 16:00 WIB.'
    },
    {
      id: 'pra-5',
      date: pemanggilan,
      title: 'Pemanggilan RUPS (Website IDX, KSEI, & Perseroan)',
      desc: 'Paling lambat 21 hari kalender sebelum tanggal RUPS, tidak memperhitungkan tanggal pemanggilan dan pelaksanaan rapat.',
      category: 'pra',
      legalBasis: 'POJK No. 15/POJK.04/2020 Pasal 17 ayat (1)',
      notes: 'Memuat tata cara kehadiran, mata acara, ketersediaan bahan, dan e-proxy KSEI.'
    },
    {
      id: 'hari-h',
      date: n,
      title: 'PELAKSANAAN RAPAT UMUM PEMEGANG SAHAM (RUPS)',
      desc: 'Pelaksanaan Rapat Umum Pemegang Saham Tahunan (RUPST) atau Luar Biasa (RUPSLB).',
      category: 'hari-h',
      isMain: true,
      legalBasis: 'UU No. 40 Tahun 2007 (UUPT) & POJK No. 15/POJK.04/2020',
      notes: 'Dilaksanakan secara fisik dan/atau elektronik melalui sistem e-RUPS (eASY.KSEI).'
    },
    {
      id: 'pasca-1',
      date: ringkasanRisalah,
      title: 'Pengumuman Ringkasan Risalah RUPS',
      desc: 'Paling lambat 2 hari kerja bursa setelah pelaksanaan RUPS.',
      category: 'pasca',
      legalBasis: 'POJK No. 15/POJK.04/2020 Pasal 51 ayat (1) & (2)',
      notes: 'Wajib dilaporkan ke OJK & BEI serta diumumkan di situs web BEI, KSEI, dan Perseroan.'
    },
    {
      id: 'pasca-2',
      date: risalahLengkap,
      title: 'Penyampaian Risalah Lengkap RUPS (Akta Notaris)',
      desc: 'Paling lambat 30 hari kalender setelah pelaksanaan RUPS.',
      category: 'pasca',
      legalBasis: 'POJK No. 15/POJK.04/2020 Pasal 52 ayat (1)',
      notes: 'Salinan akta risalah rapat yang dibuat oleh Notaris wajib disampaikan kepada OJK.'
    },
    // Jadwal Dividen
    {
      id: 'div-1',
      date: cumReguler,
      title: 'Cum Dividen (Pasar Reguler & Negosiasi)',
      desc: '2 hari kerja bursa sebelum Recording Date Dividen.',
      category: 'dividen',
      legalBasis: 'Peraturan BEI No. II-A tentang Perdagangan Efek',
      notes: 'Hari terakhir perdagangan saham dengan hak dividen di pasar reguler & negosiasi.'
    },
    {
      id: 'div-2',
      date: exReguler,
      title: 'Ex Dividen (Pasar Reguler & Negosiasi)',
      desc: '1 hari kerja bursa setelah Cum Dividen Pasar Reguler & Negosiasi.',
      category: 'dividen',
      legalBasis: 'Peraturan BEI No. II-A',
      notes: 'Hari pertama perdagangan saham tanpa hak dividen di pasar reguler & negosiasi.'
    },
    {
      id: 'div-3',
      date: cumTunai,
      title: 'Cum Dividen (Pasar Tunai)',
      desc: 'Sama dengan tanggal Recording Date Dividen.',
      category: 'dividen',
      legalBasis: 'Peraturan BEI No. II-A & KSEI',
      notes: 'Hari terakhir perdagangan saham dengan hak dividen di pasar tunai.'
    },
    {
      id: 'div-4',
      date: recordingDateDividen,
      title: 'Recording Date Dividen',
      desc: 'Paling cepat 8 hari kerja bursa setelah tanggal pelaksanaan RUPS.',
      category: 'dividen-rec',
      legalBasis: 'Peraturan BEI No. II-A & POJK No. 15/POJK.04/2020',
      notes: 'Tanggal penentuan pemegang rekening saham yang berhak menerima dividen tunai.'
    },
    {
      id: 'div-5',
      date: exTunai,
      title: 'Ex Dividen (Pasar Tunai)',
      desc: '1 hari kerja bursa setelah Cum Dividen Pasar Tunai.',
      category: 'dividen',
      legalBasis: 'Peraturan BEI No. II-A',
      notes: 'Hari pertama perdagangan saham tanpa hak dividen di pasar tunai.'
    },
    {
      id: 'div-6',
      date: pembayaranDividen,
      title: 'Pembayaran Dividen Tunai ke Pemegang Saham',
      desc: 'Paling lambat 30 hari kalender setelah pengumuman Ringkasan Risalah RUPS.',
      category: 'dividen',
      legalBasis: 'POJK No. 15/POJK.04/2020 & Peraturan KSEI',
      notes: 'Dana dividen didistribusikan melalui KSEI ke rekening efek pemegang saham.'
    },
  ];

  const orderMap: Record<string, number> = {
    'Cum Dividen (Pasar Reguler & Negosiasi)': 1,
    'Ex Dividen (Pasar Reguler & Negosiasi)': 2,
    'Recording Date Dividen': 3,
    'Cum Dividen (Pasar Tunai)': 4,
    'Ex Dividen (Pasar Tunai)': 5,
    'Pembayaran Dividen Tunai ke Pemegang Saham': 6
  };

  return items.sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (diff !== 0) return diff;
    return (orderMap[a.title] || 99) - (orderMap[b.title] || 99);
  });
}

// Generate self-contained standalone single HTML file for the user to upload anywhere on the web
export function generateStandaloneSingleHtml(
  currentRupsDate: string,
  currentNoticeDate: string,
  holidaysList: string[]
): string {
  const holidaysJson = JSON.stringify(holidaysList);

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RUPS Timeline Automation - Kalkulator Jadwal RUPS & Dividen POJK</title>
  <meta name="description" content="Kalkulator jadwal RUPS dan dividen perusahaan terbuka berbasis POJK OJK dan BEI - Single HTML Edition" />
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <!-- Header -->
    <header class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">POJK 15/2020 & 14/2025</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">IDX & KSEI Standard</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Single HTML Edition</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Dashboard Timeline RUPS & Dividen</h1>
          <p class="text-slate-500 text-sm mt-1">Kalkulator otomatis tahapan resmi RUPS dan agenda pembagian dividen perusahaan publik.</p>
          <p class="text-xs text-slate-400 mt-2 font-medium">Proudly Presented by <a href="https://www.linkedin.com/in/hendika-listianto-706b27352/" target="_blank" rel="noopener noreferrer" class="font-bold text-rose-500 hover:text-rose-600">hendyka</a></p>
        </div>
        <div class="flex flex-wrap gap-2 no-print">
          <button onclick="window.print()" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Cetak PDF
          </button>
          <button onclick="copySummaryText()" class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            Salin Jadwal
          </button>
        </div>
      </div>

      <!-- Quick Calculator Bar -->
      <div class="mt-6 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-slate-50 border border-indigo-200/80 rounded-2xl p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        <div class="flex-1">
          <label class="block text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">Kalkulasi RUPS Terdekat (Dari Tgl Surat OJK/BEI):</label>
          <div class="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-3 py-2 shadow-sm">
            <input type="date" id="inputNoticeDate" value="${currentNoticeDate}" class="w-full text-sm font-bold text-slate-800 outline-none bg-transparent" onchange="updateNoticeDate(this.value)">
          </div>
        </div>
        <div class="flex items-center justify-center text-indigo-400 font-black text-xl hidden lg:block">→</div>
        <div class="flex-1 bg-white border border-indigo-200 rounded-xl p-3 shadow-sm flex items-center justify-between gap-3">
          <div>
            <div class="text-[11px] font-bold text-indigo-600 uppercase">Prakiraan RUPS Tercepat:</div>
            <div id="earliestRupsLabel" class="font-extrabold text-slate-900 text-base md:text-lg">Memuat...</div>
          </div>
          <button id="btnSetEarliest" onclick="applyEarliestRups()" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
            Jadikan Target
          </button>
        </div>
      </div>
    </header>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Sidebar / Config -->
      <aside class="space-y-6">
        <!-- Target RUPS Card -->
        <div class="bg-white rounded-2xl border-2 border-rose-300 shadow-sm p-5 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg">Target Acara</div>
          <label class="block text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">Rencana Tanggal RUPS:</label>
          <input type="date" id="inputRupsDate" value="${currentRupsDate}" class="w-full text-xl font-black text-rose-950 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" onchange="updateRupsDate(this.value)">
          <div id="countdownBadge" class="mt-3 text-xs font-semibold text-rose-600 flex items-center gap-1.5">
            <span>●</span> <span id="countdownText">Menghitung...</span>
          </div>
        </div>

        <!-- Holiday Accordion -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer" onclick="toggleHolidays()">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 class="font-bold text-slate-800 text-sm">Libur Bursa Efek (<span id="holidayCount">0</span>)</h3>
            </div>
            <span id="holidayToggleIcon" class="text-slate-400 text-sm font-bold">▼</span>
          </div>
          <div id="holidayBody" class="p-4 space-y-3">
            <p class="text-xs text-slate-500">Sabtu & Minggu otomatis diabaikan sistem.</p>
            <div class="flex gap-2">
              <input type="date" id="newHolidayDate" class="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-rose-500">
              <button onclick="addManualHoliday()" class="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors">Tambah</button>
            </div>
            <div id="holidayListContainer" class="max-h-56 overflow-y-auto space-y-1.5 text-xs pr-1"></div>
          </div>
        </div>

        <!-- Category Legend -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2.5 text-xs">
          <h4 class="font-bold text-slate-800 text-sm mb-2">Keterangan Warna</h4>
          <div class="flex items-center gap-2.5"><span class="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-300"></span> <span class="font-medium text-slate-700">Pra-RUPS (Persiapan)</span></div>
          <div class="flex items-center gap-2.5"><span class="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-700"></span> <span class="font-bold text-emerald-900">Hari Pelaksanaan RUPS</span></div>
          <div class="flex items-center gap-2.5"><span class="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300"></span> <span class="font-medium text-slate-700">Pasca-RUPS (Pelaporan)</span></div>
          <div class="flex items-center gap-2.5"><span class="w-3.5 h-3.5 rounded bg-purple-100 border border-purple-300"></span> <span class="font-medium text-slate-700">Jadwal Dividen Tunai</span></div>
          <div class="flex items-center gap-2.5"><span class="w-3.5 h-3.5 rounded bg-indigo-600 border border-indigo-700"></span> <span class="font-bold text-indigo-900">Recording Date Dividen</span></div>
        </div>
      </aside>

      <!-- Main Content / Timeline Table -->
      <main class="lg:col-span-3 space-y-6">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900">Jadwal Resmi Kepatuhan RUPS</h2>
            <button onclick="toggleDividenSection()" id="btnToggleDividen" class="text-xs font-semibold px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
              Tampilkan Dividen (6)
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th class="px-4 py-3 text-center w-12">No</th>
                  <th class="px-4 py-3 min-w-[220px]">Agenda & Tahapan</th>
                  <th class="px-4 py-3 min-w-[280px]">Ketentuan Regulasi</th>
                  <th class="px-4 py-3 whitespace-nowrap">Tanggal Sah</th>
                </tr>
              </thead>
              <tbody id="tableBodyRups"></tbody>
              <tbody id="tableBodyDividen" class="hidden border-t-2 border-purple-200"></tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>

  <script>
    let holidayDates = ${holidaysJson};
    let rupsDate = "${currentRupsDate}";
    let noticeDate = "${currentNoticeDate}";
    let showDividen = true;

    function parseD(str) {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }

    function formatD(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + d;
    }

    function addCalDays(str, n) {
      const d = parseD(str);
      d.setDate(d.getDate() + n);
      return formatD(d);
    }

    function isOff(date) {
      const day = date.getDay();
      if (day === 0 || day === 6) return true;
      return holidayDates.includes(formatD(date));
    }

    function addWork(str, workDays) {
      const current = parseD(str);
      let count = 0;
      const dir = workDays > 0 ? 1 : -1;
      const target = Math.abs(workDays);
      if (target === 0) {
        while (isOff(current)) current.setDate(current.getDate() + 1);
        return formatD(current);
      }
      while (count < target) {
        current.setDate(current.getDate() + dir);
        if (!isOff(current)) count++;
      }
      return formatD(current);
    }

    function formatId(str) {
      if (!str) return '-';
      const d = parseD(str);
      return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    function calcEarliest(notifStr) {
      if (!notifStr) return null;
      let testDate = addWork(addCalDays(notifStr, 35), 1);
      for (let i = 0; i < 40; i++) {
        const pemanggilan = addWork(addCalDays(testDate, -21), -1);
        const pengumuman = addWork(addCalDays(pemanggilan, -14), -1);
        const suratOjk = addWork(pengumuman, -5);
        if (parseD(suratOjk).getTime() >= parseD(notifStr).getTime()) return testDate;
        testDate = addWork(testDate, 1);
      }
      return null;
    }

    let calculatedEarliest = null;

    function render() {
      // Ensure RUPS date is not on weekend/holiday
      if (isOff(parseD(rupsDate))) {
        rupsDate = addWork(rupsDate, 0);
        document.getElementById('inputRupsDate').value = rupsDate;
      }

      // Earliest calculation
      calculatedEarliest = calcEarliest(noticeDate);
      document.getElementById('earliestRupsLabel').textContent = calculatedEarliest ? formatId(calculatedEarliest) : '-';

      // Countdown
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const target = parseD(rupsDate);
      const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      document.getElementById('countdownText').textContent = diffDays >= 0 ? diffDays + ' hari lagi menuju RUPS' : Math.abs(diffDays) + ' hari yang lalu';

      // Holiday list
      document.getElementById('holidayCount').textContent = holidayDates.length;
      const listEl = document.getElementById('holidayListContainer');
      listEl.innerHTML = holidayDates.slice().sort().map(d => \`
        <div class="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200 rounded">
          <span>\${formatId(d)}</span>
          <button onclick="removeHoliday('\${d}')" class="text-slate-400 hover:text-rose-500 font-bold px-1">✕</button>
        </div>
      \`).join('');

      // Calculation
      const n = rupsDate;
      const pemanggilan = addWork(addCalDays(n, -21), -1);
      const pengumuman = addWork(addCalDays(pemanggilan, -14), -1);
      const suratOjk = addWork(pengumuman, -5);
      const batasUsulan = addWork(addCalDays(pemanggilan, -6), -1);
      const recRups = addWork(pemanggilan, -1);
      const ringkasan = addWork(n, 2);
      const risalahLengkap = addWork(addCalDays(n, 29), 1);

      const recDiv = addWork(n, 8);
      const cumReg = addWork(recDiv, -2);
      const exReg = addWork(cumReg, 1);
      const cumTunai = recDiv;
      const exTunai = addWork(cumTunai, 1);
      const bayarDiv = addWork(ringkasan, 30);

      const itemsRups = [
        { no: 1, cat: 'pra', title: 'Surat Pemberitahuan Rencana RUPS kepada OJK dan BEI', desc: '5 bursa kerja sebelum iklan Pengumuman RUPS (POJK 15/2020)', date: suratOjk },
        { no: 2, cat: 'pra', title: 'Pengumuman RUPS, Website IDX, Website KSEI, dan Website Perseroan', desc: '14 hari sebelum iklan panggilan (tidak termasuk tgl pengumuman & panggilan)', date: pengumuman },
        { no: 3, cat: 'pra', title: 'Akhir Penerimaan usulan tambahan agenda RUPS / Perubahan Mata Acara', desc: '7 hari sebelum iklan panggilan RUPS', date: batasUsulan },
        { no: 4, cat: 'pra', title: 'Tanggal Daftar Pemegang Saham yang Berhak RUPS (Recording Date)', desc: '1 hari bursa sebelum tanggal iklan pemanggilan', date: recRups },
        { no: 5, cat: 'pra', title: 'Pemanggilan RUPS, Website IDX, Website KSEI, dan Website Perseroan', desc: '21 hari sebelum RUPS (tidak termasuk tgl rapat & pemanggilan)', date: pemanggilan },
        { no: 6, cat: 'hari-h', title: 'PELAKSANAAN RAPAT UMUM PEMEGANG SAHAM (RUPS)', desc: 'Pelaksanaan Rapat Umum Pemegang Saham Tahunan/Luar Biasa', date: n },
        { no: 7, cat: 'pasca', title: 'Pengumuman Ringkasan Risalah RUPS', desc: '2 hari kerja setelah Tanggal Pelaksanaan RUPS', date: ringkasan },
        { no: 8, cat: 'pasca', title: 'Penyampaian Risalah Lengkap RUPS ke OJK', desc: '30 hari setelah Tanggal Pelaksanaan RUPS', date: risalahLengkap }
      ];

      const itemsDiv = [
        { no: 9, cat: 'dividen', title: 'Cum Dividen (Pasar Reguler & Negosiasi)', desc: '2 hari bursa sebelum Recording Date Dividen', date: cumReg },
        { no: 10, cat: 'dividen', title: 'Ex Dividen (Pasar Reguler & Negosiasi)', desc: '1 hari bursa setelah Cum Reguler', date: exReg },
        { no: 11, cat: 'dividen', title: 'Cum Dividen (Pasar Tunai)', desc: 'Sama dengan tanggal Recording Date Dividen', date: cumTunai },
        { no: 12, cat: 'dividen-rec', title: 'Recording Date Dividen', desc: '8 hari bursa setelah tanggal Pelaksanaan RUPS', date: recDiv },
        { no: 13, cat: 'dividen', title: 'Ex Dividen (Pasar Tunai)', desc: '1 hari bursa setelah Cum Pasar Tunai', date: exTunai },
        { no: 14, cat: 'dividen', title: 'Pembayaran Dividen Tunai ke Rekening Pemegang Saham', desc: 'Paling lambat 30 hari kalender setelah Ringkasan Risalah', date: bayarDiv }
      ];

      function getRowClass(cat) {
        if (cat === 'pra') return 'bg-blue-50/50 hover:bg-blue-50/90 text-slate-800 border-blue-100';
        if (cat === 'hari-h') return 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-sm';
        if (cat === 'pasca') return 'bg-amber-50/50 hover:bg-amber-50/90 text-slate-800 border-amber-100';
        if (cat === 'dividen-rec') return 'bg-indigo-600 text-white font-bold border-indigo-700';
        return 'bg-purple-50/40 hover:bg-purple-50/80 text-slate-800 border-purple-100';
      }

      function renderRow(item) {
        const isHighlight = item.cat === 'hari-h' || item.cat === 'dividen-rec';
        return \`
          <tr class="border-b \${getRowClass(item.cat)} transition-colors">
            <td class="px-4 py-3.5 text-center font-bold opacity-75">\${item.no}</td>
            <td class="px-4 py-3.5 font-bold \${isHighlight ? 'text-white' : 'text-slate-900'}">\${item.title}</td>
            <td class="px-4 py-3.5 text-xs \${isHighlight ? 'text-white/90' : 'text-slate-600 font-medium'}">\${item.desc}</td>
            <td class="px-4 py-3.5 whitespace-nowrap font-bold">
              <span class="\${isHighlight ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-900'} px-2.5 py-1 rounded-lg text-xs shadow-xs">
                \${formatId(item.date)}
              </span>
            </td>
          </tr>
        \`;
      }

      document.getElementById('tableBodyRups').innerHTML = itemsRups.map(renderRow).join('');
      document.getElementById('tableBodyDividen').innerHTML = itemsDiv.map(renderRow).join('');
    }

    function updateRupsDate(val) {
      rupsDate = val;
      render();
    }

    function updateNoticeDate(val) {
      noticeDate = val;
      render();
    }

    function applyEarliestRups() {
      if (calculatedEarliest) {
        rupsDate = calculatedEarliest;
        document.getElementById('inputRupsDate').value = rupsDate;
        render();
      }
    }

    function toggleHolidays() {
      const el = document.getElementById('holidayBody');
      const icon = document.getElementById('holidayToggleIcon');
      if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        icon.textContent = '▼';
      } else {
        el.classList.add('hidden');
        icon.textContent = '▶';
      }
    }

    function addManualHoliday() {
      const input = document.getElementById('newHolidayDate');
      const val = input.value;
      if (val && !holidayDates.includes(val)) {
        holidayDates.push(val);
        input.value = '';
        render();
      }
    }

    function removeHoliday(dateStr) {
      holidayDates = holidayDates.filter(d => d !== dateStr);
      render();
    }

    function toggleDividenSection() {
      showDividen = !showDividen;
      const tbody = document.getElementById('tableBodyDividen');
      const btn = document.getElementById('btnToggleDividen');
      if (showDividen) {
        tbody.classList.remove('hidden');
        btn.textContent = 'Sembunyikan Dividen';
      } else {
        tbody.classList.add('hidden');
        btn.textContent = 'Tampilkan Dividen (6)';
      }
    }

    function copySummaryText() {
      let text = "TIMELINE RESMI RUPS & DIVIDEN (POJK 15/2020)\\nTanggal RUPS: " + formatId(rupsDate) + "\\n\\n";
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(r => {
        const cols = r.querySelectorAll('td');
        if (cols.length >= 4) {
          text += cols[0].innerText + ". " + cols[1].innerText + " -> " + cols[3].innerText.trim() + "\\n";
        }
      });
      navigator.clipboard.writeText(text).then(() => {
        alert("Jadwal berhasil disalin ke clipboard!");
      });
    }

    // Initial render
    render();
    toggleDividenSection(); // start with dividen visible
  </script>
</body>
</html>`;
}

// Export timeline to CSV format
export function exportToCsv(items: TimelineItem[], rupsDate: string): void {
  const headers = ['No', 'Agenda / Tahapan RUPS', 'Kategori', 'Tanggal Sah (YYYY-MM-DD)', 'Tanggal Format Indonesia', 'Ketentuan Regulasi', 'Dasar Hukum'];
  const rows = items.map((item, index) => [
    index + 1,
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    item.date,
    `"${formatDateIndonesian(item.date)}"`,
    `"${item.desc.replace(/"/g, '""')}"`,
    `"${(item.legalBasis || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Timeline_RUPS_${rupsDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export timeline to iCalendar (.ics) format for Google Calendar / Outlook
export function exportToIcs(items: TimelineItem[], rupsDate: string): void {
  const formatIcsDate = (dateStr: string) => {
    return dateStr.replace(/-/g, '');
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RUPS Timeline Automation//Hendyka//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Timeline RUPS ' + rupsDate
  ];

  items.forEach(item => {
    const dt = formatIcsDate(item.date);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:rups-${item.id}-${dt}@rups-timeline.app`);
    lines.push(`DTSTAMP:${formatIcsDate(new Date().toISOString().split('T')[0])}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`SUMMARY:${item.title}`);
    lines.push(`DESCRIPTION:${item.desc} (Dasar Hukum: ${item.legalBasis || 'POJK 15/POJK.04/2020'})`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Kalender_RUPS_${rupsDate}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
