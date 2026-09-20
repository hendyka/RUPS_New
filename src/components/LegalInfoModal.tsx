import React from 'react';
import { X, BookOpen, Scale, FileText, CheckCircle2 } from 'lucide-react';

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">
                Dasar Hukum & Panduan Regulasi POJK
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ketentuan Penyelenggaraan RUPS Berdasarkan Regulasi OJK & BEI
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
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs md:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>1. POJK No. 15/POJK.04/2020 & POJK No. 14 Tahun 2025</span>
            </h3>
            <p className="text-slate-600">
              Mengatur tentang Rencana dan Penyelenggaraan Rapat Umum Pemegang Saham Perusahaan Terbuka:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 font-medium pl-1">
              <li>
                <strong>Pemberitahuan Rencana RUPS (Pasal 14):</strong> Wajib disampaikan kepada OJK dan Bursa paling lambat 5 (lima) hari kerja sebelum pengumuman RUPS.
              </li>
              <li>
                <strong>Pengumuman RUPS (Pasal 16):</strong> Wajib dilakukan paling lambat 14 (empat belas) hari kalender sebelum pemanggilan RUPS, tanpa memperhitungkan tanggal pengumuman dan pemanggilan.
              </li>
              <li>
                <strong>Usulan Mata Acara (Pasal 16 ayat 2):</strong> Usulan dari pemegang saham (minimal 1/20 saham) harus diterima paling lambat 7 hari kalender sebelum tanggal pemanggilan RUPS.
              </li>
              <li>
                <strong>Recording Date RUPS (Pasal 19):</strong> Penentuan DPS yang berhak hadir dilakukan paling lambat 1 hari kerja bursa sebelum tanggal pemanggilan RUPS.
              </li>
              <li>
                <strong>Pemanggilan RUPS (Pasal 17):</strong> Wajib dilakukan paling lambat 21 (dua puluh satu) hari kalender sebelum tanggal pelaksanaan RUPS, tanpa memperhitungkan tanggal pemanggilan dan rapat.
              </li>
              <li>
                <strong>Pengumuman Ringkasan Risalah (Pasal 51):</strong> Wajib diumumkan dalam waktu paling lambat 2 (dua) hari kerja setelah pelaksanaan RUPS.
              </li>
              <li>
                <strong>Penyampaian Risalah Lengkap (Pasal 52):</strong> Salinan akta risalah RUPS wajib disampaikan ke OJK paling lambat 30 hari kalender setelah rapat.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
            <h3 className="font-extrabold text-purple-950 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-700" />
              <span>2. Ketentuan Dividen Saham & Tunai (Peraturan BEI II-A)</span>
            </h3>
            <p className="text-purple-900/80">
              Jadwal pelaksanaan pembagian dividen tunai diatur secara ketat oleh Bursa Efek Indonesia dan KSEI:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-purple-950 font-medium pl-1">
              <li><strong>Cum Dividen:</strong> Hari terakhir perdagangan saham yang masih mengandung hak dividen (Reguler & Negosiasi = 2 hari bursa sebelum recording date; Tunai = sama dengan recording date).</li>
              <li><strong>Ex Dividen:</strong> Hari pertama perdagangan saham tanpa hak dividen (1 hari bursa setelah Cum Date).</li>
              <li><strong>Recording Date Dividen:</strong> Paling cepat 8 hari bursa setelah tanggal pelaksanaan RUPS.</li>
              <li><strong>Pembayaran Dividen:</strong> Paling lambat 30 hari kalender setelah pengumuman Ringkasan Risalah RUPS.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <h3 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>3. Sistem e-RUPS (eASY.KSEI)</span>
            </h3>
            <p className="text-emerald-900/80">
              Emiten wajib menyediakan fasilitas pelaksanaan RUPS secara elektronik dan pemberian kuasa secara elektronik (e-Proxy) melalui sistem eASY.KSEI yang disediakan oleh Kustodian Sentral Efek Indonesia.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs md:text-sm font-bold transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
