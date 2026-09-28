import React, { useState, useRef } from 'react';
import { 
  CalendarOff, 
  Plus, 
  Upload, 
  Trash2, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Palette, 
  HelpCircle, 
  FileDown 
} from 'lucide-react';
import { HolidayItem } from '../types';
import { formatDateIndonesian, parseHolidayCsv } from '../utils/rupsCalculator';

interface HolidaySidebarProps {
  holidays: HolidayItem[];
  onAddHoliday: (date: string, name?: string) => void;
  onRemoveHoliday: (date: string) => void;
  onResetHolidays: () => void;
  onBatchAddHolidays: (items: HolidayItem[]) => void;
  onShowAlert: (text: string, type: 'success' | 'alert' | 'error') => void;
}

export const HolidaySidebar: React.FC<HolidaySidebarProps> = ({
  holidays,
  onAddHoliday,
  onRemoveHoliday,
  onResetHolidays,
  onBatchAddHolidays,
  onShowAlert,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newDate) return;
    if (holidays.some((h) => h.date === newDate)) {
      onShowAlert('Tanggal libur ini sudah ada dalam daftar.', 'alert');
      return;
    }
    const label = newName.trim() || 'Libur Bursa';
    onAddHoliday(newDate, label);
    setNewDate('');
    setNewName('');
    onShowAlert(`Berhasil menambahkan libur: ${label}`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const parsedItems = parseHolidayCsv(text);
        if (parsedItems.length > 0) {
          onBatchAddHolidays(parsedItems);
          onShowAlert(`Berhasil mengimpor ${parsedItems.length} hari libur & cuti bersama dari file!`, 'success');
        } else {
          onShowAlert('Format file tidak sesuai atau tidak ditemukan data tanggal yang valid.', 'error');
        }
      } catch (err) {
        onShowAlert('Gagal membaca file CSV libur bursa.', 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csvTemplate = `Hari;Tgl;Bulan;Tahun;Keterangan\nKamis;1;Januari;2026;Tahun Baru 2026 Masehi\nJumat;16;Januari;2026;Isra Mikraj Nabi Muhammad SAW\nSenin;16;Februari;2026;Cuti Bersama Tahun Baru Imlek 2577 Kongzili`;
    const blob = new Blob(['\ufeff' + csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_Libur_Bursa.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* 1. Bursa Holidays Accordion */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-5 flex items-center justify-between text-left bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <CalendarOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Libur & Cuti Bersama</h3>
              <p className="text-xs text-slate-500 font-medium">
                {holidays.length} hari bursa dikecualikan
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg bg-white border border-slate-200 text-slate-500">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isOpen && (
          <div className="p-5 border-t border-slate-200/80 space-y-4">
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
              Sabtu & Minggu otomatis diabaikan sistem kalkulasi bursa. Tanggal libur di bawah dikecualikan dari hari kerja aktif untuk jadwal RUPS.
            </div>

            {/* Form Add Manual */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Tambah Hari Libur Manual:</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama Hari Libur / Cuti Bersama..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!newDate}
                    className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions: Upload CSV & Template & Reset */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload CSV Libur Bursa</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  title="Unduh contoh template CSV"
                >
                  <FileDown className="w-3 h-3" />
                  <span>Template CSV</span>
                </button>

                <button
                  onClick={onResetHolidays}
                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  title="Kembalikan ke libur bawaan bursa 2026"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Bawaan</span>
                </button>
              </div>
            </div>

            {/* List of holidays */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {holidays.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">Tidak ada hari libur khusus.</div>
              ) : (
                holidays
                  .slice()
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((h) => {
                    const isCb = h.name.toLowerCase().includes('cuti bersama');
                    return (
                      <div
                        key={h.date}
                        className="flex items-start justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs transition-colors gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">
                              {formatDateIndonesian(h.date)}
                            </span>
                            <span 
                              className={`text-[8.5px] font-black uppercase px-1 py-0.2 rounded border ${
                                isCb 
                                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {isCb ? 'CB' : 'Libur'}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-600 truncate">
                            {h.name}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveHoliday(h.date)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0 mt-0.5"
                          title="Hapus hari libur ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Color Legend Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 space-y-3.5">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">Keterangan Warna Tahapan</h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-blue-100 border border-blue-300 shrink-0" />
            <span className="text-slate-700 font-semibold">Pra-RUPS (Persiapan & Pemberitahuan)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-emerald-600 border border-emerald-700 shrink-0 shadow-xs" />
            <span className="text-slate-900 font-extrabold">Hari Pelaksanaan RUPS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-amber-100 border border-amber-300 shrink-0" />
            <span className="text-slate-700 font-semibold">Pasca-RUPS (Pelaporan & Risalah)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-purple-100 border border-purple-300 shrink-0" />
            <span className="text-slate-700 font-semibold">Jadwal Dividen Tunai (Cum & Ex Date)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-rose-100 border border-rose-300 shrink-0" />
            <span className="text-slate-700 font-semibold">Libur Bursa Efek Indonesia</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-amber-100 border border-amber-300 shrink-0" />
            <span className="text-slate-700 font-semibold">Cuti Bersama Bursa Efek</span>
          </div>
        </div>
      </div>

      {/* 3. Statutory Tip Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2 text-amber-400">
          <HelpCircle className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Ketentuan RUPST Tahunan</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Sesuai Pasal 78 UUPT No. 40/2007 dan POJK 15/2020, RUPST Tahunan wajib diselenggarakan paling lambat 6 bulan setelah tahun buku berakhir (biasanya 30 Juni).
        </p>
      </div>
    </div>
  );
};
