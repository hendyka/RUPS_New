import React from 'react';
import { Calendar as CalendarIcon, ArrowRight, CheckCircle2, Zap, Clock, AlertTriangle } from 'lucide-react';
import { formatDateIndonesian, getDaysDiffFromToday } from '../utils/rupsCalculator';

interface CalculatorCardProps {
  noticeDate: string;
  onNoticeDateChange: (val: string) => void;
  earliestRupsDate: string | null;
  onApplyEarliestRups: () => void;
  rupsDate: string;
  onRupsDateChange: (val: string) => void;
  isDateShifted: boolean;
  onQuickPreset: (dateStr: string) => void;
}

export const CalculatorCard: React.FC<CalculatorCardProps> = ({
  noticeDate,
  onNoticeDateChange,
  earliestRupsDate,
  onApplyEarliestRups,
  rupsDate,
  onRupsDateChange,
  isDateShifted,
  onQuickPreset,
}) => {
  const diffDays = getDaysDiffFromToday(rupsDate);

  // Helper presets
  const currentYear = new Date().getFullYear();
  const presets = [
    { label: 'Mei 2026', date: '2026-05-11' },
    { label: 'Juni 2026 (Batas RUPST)', date: '2026-06-25' },
    { label: 'Bulan Depan', date: getNextMonthDate() },
  ];

  function getNextMonthDate() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-15`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Forward Calculator Card (Kalkulasi RUPS Terdekat dari Surat OJK/BEI) */}
      <div className="lg:col-span-7 bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-white border border-indigo-200/80 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-base md:text-lg font-extrabold text-indigo-950">
              Kalkulasi RUPS Terdekat (Forward Calculator)
            </h2>
          </div>
          <p className="text-xs md:text-sm text-indigo-900/70 mb-4">
            Masukkan rencana tanggal penyampaian surat pemberitahuan mata acara kepada OJK dan BEI untuk memperoleh tanggal RUPS sah tercepat.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Input Date */}
            <div className="sm:col-span-6 bg-white border border-indigo-200 rounded-2xl p-3 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500">
              <label className="block text-[11px] font-bold text-indigo-900/70 uppercase tracking-wider mb-1">
                Tgl Surat Pemberitahuan OJK / BEI:
              </label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                <input
                  type="date"
                  value={noticeDate}
                  onChange={(e) => onNoticeDateChange(e.target.value)}
                  className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="hidden sm:flex sm:col-span-1 justify-center text-indigo-300">
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Result Box */}
            <div className="sm:col-span-5 bg-white border border-indigo-200 rounded-2xl p-3 shadow-xs flex flex-col justify-center">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                Prakiraan RUPS Tercepat:
              </span>
              <span className="text-sm font-black text-slate-900 truncate">
                {earliestRupsDate ? formatDateIndonesian(earliestRupsDate) : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-indigo-700/80 font-medium">
            Memperhitungkan 5 bursa kerja + 14 hari + 21 hari (POJK 15/2020)
          </span>
          <button
            onClick={onApplyEarliestRups}
            disabled={!earliestRupsDate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs md:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Jadikan Target Acara</span>
          </button>
        </div>
      </div>

      {/* 2. Target Date Selector Card (Rencana Tanggal Pelaksanaan RUPS) */}
      <div className="lg:col-span-5 bg-white border-2 border-rose-200/90 rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
          Target Acara RUPS
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="w-5 h-5 text-rose-600" />
            <label className="text-xs font-black text-rose-900 uppercase tracking-widest cursor-pointer">
              Rencana Pelaksanaan RUPS
            </label>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Ubah tanggal di bawah ini untuk menghitung mundur seluruh jadwal kepatuhan.
          </p>

          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 flex items-center gap-3">
            <input
              type="date"
              value={rupsDate}
              onChange={(e) => onRupsDateChange(e.target.value)}
              className="text-lg md:text-xl font-black text-rose-950 bg-transparent outline-none w-full cursor-pointer"
            />
          </div>

          {/* Shift warning if auto-adjusted */}
          {isDateShifted && (
            <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <span>Tanggal digeser otomatis karena bertepatan dengan akhir pekan / libur bursa.</span>
            </div>
          )}

          {/* Countdown badge */}
          <div className="mt-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>
                {diffDays > 0
                  ? `${diffDays} hari lagi menuju RUPS`
                  : diffDays === 0
                  ? 'Hari ini pelaksanaan RUPS!'
                  : `${Math.abs(diffDays)} hari yang lalu`}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400">Pilihan Cepat:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onQuickPreset(p.date)}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
