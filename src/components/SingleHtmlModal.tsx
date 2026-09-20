import React from 'react';
import { X, Download, Copy, Check, Sparkles, Globe, FileCode, Server } from 'lucide-react';
import { generateStandaloneSingleHtml } from '../utils/rupsCalculator';

interface SingleHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  rupsDate: string;
  noticeDate: string;
  holidayDates: string[];
  onShowAlert: (text: string, type: 'success' | 'alert' | 'error') => void;
}

export const SingleHtmlModal: React.FC<SingleHtmlModalProps> = ({
  isOpen,
  onClose,
  rupsDate,
  noticeDate,
  holidayDates,
  onShowAlert,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const htmlContent = generateStandaloneSingleHtml(rupsDate, noticeDate, holidayDates);
  const fileSizeKb = Math.round(new Blob([htmlContent]).size / 1024);

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rups-timeline-single.html';
    link.click();
    URL.revokeObjectURL(url);
    onShowAlert('File single HTML berhasil didownload! Siap diunggah ke web mana saja.', 'success');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    onShowAlert('Seluruh kode HTML mandiri telah disalin ke clipboard.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-rose-50 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Single HTML Standalone File</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {fileSizeKb} KB
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Website mandiri satu file tanpa dependensi server, siap di-upload ke web hosting mana saja!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 text-xs md:text-sm">
          {/* Highlight feature card */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Kelebihan Format Single HTML:</span>
            </div>
            <ul className="list-disc list-inside text-indigo-950/80 space-y-1 text-xs font-medium pl-1">
              <li>Berisi seluruh JavaScript kalkulasi, Tailwind CSS, struktur HTML, dan data libur bursa.</li>
              <li>Bisa dibuka langsung di browser secara offline tanpa koneksi internet atau server backend.</li>
              <li>Bisa langsung di-rename menjadi <code>index.html</code> dan diupload ke cPanel, Vercel, Netlify Drop, GitHub Pages, atau shared hosting apapun.</li>
            </ul>
          </div>

          {/* Quick upload instructions */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-600" />
              <span>Cara Upload ke Web:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="font-bold text-slate-900 block">1. Vercel / Netlify</span>
                <p className="text-slate-500">
                  Tarik (drag & drop) file ini atau ganti nama jadi <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">index.html</code> pada deploy folder.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="font-bold text-slate-900 block">2. GitHub Pages</span>
                <p className="text-slate-500">
                  Buat repository, masukkan file sebagai <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">index.html</code>, lalu aktifkan Pages di Settings.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="font-bold text-slate-900 block">3. cPanel / Web Host</span>
                <p className="text-slate-500">
                  Upload file ke folder <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">public_html</code> sebagai <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">index.html</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Code snippet preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Preview Struktur Single HTML:</span>
              <span className="text-[11px] text-slate-400 font-mono">HTML5 + Tailwind CSS</span>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-36 leading-tight select-all">
              {htmlContent.slice(0, 800)}...
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyCode}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Kode Tersalin!' : 'Salin Semua Kode HTML'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs md:text-sm font-semibold rounded-xl"
            >
              Tutup
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs md:text-sm font-black shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download File HTML (.html)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
