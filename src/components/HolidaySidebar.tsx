import React from 'react';
import { CalendarOff, Plus, Upload, Trash2, RotateCcw, ChevronDown, ChevronUp, Palette, HelpCircle, FileDown } from 'lucide-react';
import { formatDateIndonesian } from '../utils/rupsCalculator';
import { MONTH_MAP } from '../utils/rupsCalculator';

interface HolidaySidebarProps {
  holidays: string[];
  onAddHoliday: (date: string) => void;
  onRemoveHoliday: (date: string) => void;
  onResetHolidays: () => void;
  onBatchAddHolidays: (dates: string[]) => void;
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [newDate, setNewDate] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newDate) return;
    if (holidays.includes(newDate)) {
      onShowAlert('Tanggal libur ini sudah ada dalam daftar.', 'alert');
      return;
    }
    onAddHoliday(newDate);
    setNewDate('');
    onShowAlert('Berhasil menambahkan hari libur bursa.', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/);
        if (lines.length === 0) return;

        // Detect separator
        const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].toLowerCase().split(delimiter).map((s) => s.trim());
        const tglIdx = headers.indexOf('tgl');
        const bulanIdx = headers.indexOf('bulan');
        const tahunIdx = headers.indexOf('tahun');

        const newDates: string[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(delimiter).map((c) => c.trim());

          let parsedDate: string | null = null;
          if (tglIdx > -1 && bulanIdx > -1 && tahunIdx > -1 && cols[tglIdx] && cols[bulanIdx] && cols[tahunIdx]) {
            const day = String(cols[tglIdx]).padStart(2, '0');
            const monthStr = cols[bulanIdx].toLowerCase();
            const monthNum = MONTH_MAP[monthStr] || '01';
            const year = cols[tahunIdx];
            parsedDate = `${year}-${monthNum}-${day}`;
          } else {
            const match = line.match(/\d{4}-\d{2}-\d{2}/);
            if (match) parsedDate = match[0];
          }

          if (parsedDate && /^\d{4}-\d{2}-\d{2}$/.test(parsedDate) && !newDates.includes(parsedDate)) {
            newDates.push(parsedDate);
          }
        }

        if (newDates.length > 0) {
          onBatchAddHolidays(newDates);
          onShowAlert(`Berhasil mengimpor ${newDates.length} hari libur bursa dari file!`, 'success');
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
    const csvTemplate = `Hari;Tgl;Bulan;Tahun;Keterangan\nKamis;1;Januari;2026;Tahun Baru 2026\nJumat;16;Januari;2026;Isra Mikraj`;
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
              <h3 className="text-sm font-bold text-slate-800">Daftar Libur Bursa</h3>
              <p className="text-xs text-slate-500 font-medium">
                {holidays.length} hari libur aktif terdaftar
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
              Sabtu & Minggu otomatis diabaikan sistem kalkulasi bursa. Tanggal libur di bawah dikecualikan dari hari bursa aktif.
            </div>

            {/* Form Add Manual */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Tambah Hari Libur:</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
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
                <span>Upload Excel / CSV Libur</span>
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
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {holidays.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">Tidak ada hari libur khusus.</div>
              ) : (
                holidays
                  .slice()
                  .sort()
                  .map((dateStr) => (
                    <div
                      key={dateStr}
                      className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs transition-colors"
                    >
                      <span className="font-semibold text-slate-700">{formatDateIndonesian(dateStr)}</span>
                      <button
                        onClick={() => onRemoveHoliday(dateStr)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Hapus hari libur ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
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
            <div className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-700 shrink-0 shadow-xs" />
            <span className="text-slate-900 font-extrabold">Recording Date Dividen</span>
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
