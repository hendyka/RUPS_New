import React from 'react';
import { Calendar, Download, FileSpreadsheet, Printer, Copy, Check, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import { TimelineItem } from '../types';
import { exportToCsv, exportToIcs, formatDateIndonesian } from '../utils/rupsCalculator';

interface HeaderProps {
  timelineItems: TimelineItem[];
  rupsDate: string;
  onOpenSingleHtml: () => void;
  onOpenLegalGuide: () => void;
  onShowAlert: (text: string, type: 'success' | 'alert' | 'error') => void;
}

export const Header: React.FC<HeaderProps> = ({
  timelineItems,
  rupsDate,
  onOpenSingleHtml,
  onOpenLegalGuide,
  onShowAlert,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyMemo = () => {
    let text = `AGENDA & TIMELINE RESMI RUPS & DIVIDEN\n`;
    text += `Target Pelaksanaan RUPS: ${formatDateIndonesian(rupsDate)}\n`;
    text += `Dasar Regulasi: POJK No. 15/POJK.04/2020 & Standar BEI/KSEI\n\n`;
    text += `JADWAL TAHAPAN:\n`;
    timelineItems.forEach((item, idx) => {
      text += `${idx + 1}. [${item.category.toUpperCase()}] ${item.title}\n`;
      text += `   Tanggal: ${formatDateIndonesian(item.date)}\n`;
      text += `   Ketentuan: ${item.desc}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowAlert('Jadwal berhasil disalin dalam format memo rapat!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportToCsv(timelineItems, rupsDate);
    onShowAlert('Berhasil mengunduh jadwal RUPS format CSV/Excel.', 'success');
  };

  const handleExportIcs = () => {
    exportToIcs(timelineItems, rupsDate);
    onShowAlert('Berhasil mengunduh kalender .ics untuk Google/Outlook!', 'success');
  };

  return (
    <header className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-8 relative overflow-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100/60 via-blue-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
              POJK No. 15/2020 & 14/2025
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              Standar BEI & e-RUPS KSEI
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/70">
              Emiten & Perusahaan Terbuka
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                Dashboard Timeline RUPS
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Automasi & Kalkulator Kepatuhan Jadwal RUPS dan Dividen Emiten Indonesia
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1.5">
            Proudly Presented by
            <a
              href="https://www.linkedin.com/in/hendika-listianto-706b27352/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-rose-500 hover:text-rose-600 underline decoration-rose-300 underline-offset-2 inline-flex items-center gap-0.5 transition-colors"
              title="LinkedIn Profil Hendika Listianto"
            >
              hendyka
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          {/* High-priority Single HTML Button */}
          <button
            id="btn-download-single-html"
            onClick={onOpenSingleHtml}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl text-sm font-extrabold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            title="Download file single HTML mandiri untuk diupload di web mana saja"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Download Single HTML</span>
          </button>

          <button
            onClick={handleCopyMemo}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5"
            title="Salin timeline ke clipboard format memo"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5"
            title="Cetak atau simpan ke PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5"
            title="Ekspor timeline ke CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel/CSV</span>
          </button>

          <button
            onClick={handleExportIcs}
            className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5"
            title="Ekspor ke kalender Google / Outlook"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Kalender (.ics)</span>
          </button>

          <button
            onClick={onOpenLegalGuide}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5"
            title="Panduan Regulasi POJK 15/2020"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span className="hidden md:inline">Dasar Hukum</span>
          </button>
        </div>
      </div>
    </header>
  );
};
