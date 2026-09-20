import React from 'react';
import { TimelineItem, CategoryType } from '../types';
import { formatDateIndonesian, getDaysDiffFromToday } from '../utils/rupsCalculator';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  Check, 
  Share2,
  SlidersHorizontal,
  Search
} from 'lucide-react';

interface TimelineTableProps {
  items: TimelineItem[];
  showDividen: boolean;
  onToggleDividen: () => void;
  onShowAlert: (text: string, type: 'success' | 'alert' | 'error') => void;
  filterCategory: string;
  onFilterChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TimelineTable: React.FC<TimelineTableProps> = ({
  items,
  showDividen,
  onToggleDividen,
  onShowAlert,
  filterCategory,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyRow = (item: TimelineItem) => {
    const text = `${item.title}: ${formatDateIndonesian(item.date)} (${item.desc})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    onShowAlert(`Tanggal untuk "${item.title}" disalin ke clipboard.`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter items
  const nonDividenItems = items.filter((i) => i.category !== 'dividen' && i.category !== 'dividen-rec');
  const dividenItems = items.filter((i) => i.category === 'dividen' || i.category === 'dividen-rec');

  const matchesSearch = (item: TimelineItem) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      (item.legalBasis && item.legalBasis.toLowerCase().includes(q)) ||
      item.date.includes(q)
    );
  };

  const matchesCategory = (item: TimelineItem) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'pra') return item.category === 'pra';
    if (filterCategory === 'hari-h') return item.category === 'hari-h';
    if (filterCategory === 'pasca') return item.category === 'pasca';
    if (filterCategory === 'dividen') return item.category === 'dividen' || item.category === 'dividen-rec';
    return true;
  };

  const filteredNonDividen = nonDividenItems.filter((i) => matchesSearch(i) && matchesCategory(i));
  const filteredDividen = dividenItems.filter((i) => matchesSearch(i) && matchesCategory(i));

  const getCategoryStyles = (cat: CategoryType) => {
    switch (cat) {
      case 'pra':
        return {
          row: 'bg-blue-50/40 hover:bg-blue-50/80 border-blue-100 text-slate-800',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <FileText className="w-4 h-4 text-blue-600" />,
          pill: 'bg-white border border-blue-200 text-blue-900',
        };
      case 'hari-h':
        return {
          row: 'bg-emerald-600 hover:bg-emerald-600/95 border-emerald-700 text-white shadow-sm',
          badge: 'bg-emerald-700 text-white border-emerald-800',
          icon: <CheckCircle2 className="w-5 h-5 text-white" />,
          pill: 'bg-white/20 text-white border border-white/30',
        };
      case 'pasca':
        return {
          row: 'bg-amber-50/40 hover:bg-amber-50/80 border-amber-100 text-slate-800',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
          pill: 'bg-white border border-amber-200 text-amber-900',
        };
      case 'dividen-rec':
        return {
          row: 'bg-indigo-600 hover:bg-indigo-600/95 border-indigo-700 text-white shadow-sm',
          badge: 'bg-indigo-700 text-white border-indigo-800',
          icon: <Clock className="w-4 h-4 text-white" />,
          pill: 'bg-white/20 text-white border border-white/30',
        };
      case 'dividen':
        return {
          row: 'bg-purple-50/40 hover:bg-purple-50/80 border-purple-100 text-slate-800',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <Coins className="w-4 h-4 text-purple-600" />,
          pill: 'bg-white border border-purple-200 text-purple-900',
        };
      default:
        return {
          row: 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <Calendar className="w-4 h-4 text-slate-600" />,
          pill: 'bg-white border border-slate-200 text-slate-800',
        };
    }
  };

  const categories = [
    { id: 'all', label: 'Semua Agenda', count: items.length },
    { id: 'pra', label: 'Pra-RUPS', count: nonDividenItems.filter((i) => i.category === 'pra').length },
    { id: 'hari-h', label: 'Hari Pelaksanaan', count: 1 },
    { id: 'pasca', label: 'Pasca-RUPS', count: nonDividenItems.filter((i) => i.category === 'pasca').length },
    { id: 'dividen', label: 'Dividen Tunai', count: dividenItems.length },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Top Filter & Search Bar */}
      <div className="p-5 md:p-6 border-b border-slate-200/80 bg-slate-50/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Hasil Jadwal Resmi Kepatuhan RUPS</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {items.length} Agenda
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Dihitung berdasarkan hari kalender dan hari kerja bursa resmi sesuai POJK 15/2020.
            </p>
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs w-full md:w-64 focus-within:ring-2 focus-within:ring-indigo-500">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari agenda / pasal..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
              <th className="px-4 py-3.5 text-center w-14">No</th>
              <th className="px-5 py-3.5 min-w-[280px]">Kegiatan / Agenda</th>
              <th className="px-5 py-3.5 min-w-[340px]">Ketentuan & Dasar Regulasi</th>
              <th className="px-5 py-3.5 whitespace-nowrap min-w-[200px]">Tanggal Pelaksanaan Sah</th>
              <th className="px-4 py-3.5 text-center w-16 no-print">Aksi</th>
            </tr>
          </thead>

          {/* RUPS Items Body */}
          <tbody>
            {filteredNonDividen.length === 0 && filteredDividen.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  Tidak ada agenda yang cocok dengan pencarian atau filter Anda.
                </td>
              </tr>
            ) : (
              filteredNonDividen.map((item, idx) => {
                const style = getCategoryStyles(item.category);
                const isHighlight = item.category === 'hari-h';
                const diff = getDaysDiffFromToday(item.date);

                return (
                  <tr
                    key={item.id}
                    className={`border-b ${style.row} transition-colors group`}
                  >
                    {/* No */}
                    <td className="px-4 py-4 text-center font-black opacity-70">
                      {idx + 1}
                    </td>

                    {/* Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        <span className="shrink-0 mt-0.5">{style.icon}</span>
                        <div>
                          <span className={`font-black text-sm md:text-base leading-snug block ${isHighlight ? 'text-white' : 'text-slate-900'}`}>
                            {item.title}
                          </span>
                          {item.notes && (
                            <span className={`text-[11px] mt-0.5 block ${isHighlight ? 'text-white/80' : 'text-slate-500'}`}>
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Description & Legal Basis */}
                    <td className="px-5 py-4">
                      <p className={`text-xs leading-relaxed ${isHighlight ? 'text-white/90 font-medium' : 'text-slate-700 font-semibold'}`}>
                        {item.desc}
                      </p>
                      {item.legalBasis && (
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${
                          isHighlight ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.legalBasis}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap align-middle">
                      <div className="flex flex-col gap-1">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-extrabold ${style.pill} shadow-xs w-fit`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDateIndonesian(item.date)}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 ${isHighlight ? 'text-emerald-100' : diff === 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {diff === 0 ? '● Hari Ini' : diff > 0 ? `${diff} hari lagi` : `${Math.abs(diff)} hari lalu`}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-center align-middle no-print">
                      <button
                        onClick={() => handleCopyRow(item)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isHighlight 
                            ? 'bg-white/20 hover:bg-white/30 text-white border-white/30' 
                            : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
                        }`}
                        title="Salin tanggal agenda ini"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Toggle Divider for Dividen */}
          {filterCategory === 'all' && (
            <tbody>
              <tr
                onClick={onToggleDividen}
                className="bg-purple-50/70 hover:bg-purple-100/70 cursor-pointer transition-colors border-y-2 border-purple-200 group"
              >
                <td colSpan={5} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shadow-xs">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm md:text-base font-extrabold text-purple-950 flex items-center gap-2">
                          <span>Jadwal Pembagian Dividen Tunai</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-bold">
                            6 Jadwal Sah
                          </span>
                        </h3>
                        <p className="text-xs text-purple-800/80 mt-0.5">
                          Klik untuk {showDividen ? 'menyembunyikan' : 'menampilkan'} agenda cum/ex date dan pembayaran dividen.
                        </p>
                      </div>
                    </div>
                    <div className="p-1.5 bg-white border border-purple-200 rounded-lg text-purple-700 shadow-xs">
                      {showDividen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          )}

          {/* Dividen Items Body */}
          {(showDividen || filterCategory === 'dividen') && (
            <tbody>
              {filteredDividen.map((item, idx) => {
                const style = getCategoryStyles(item.category);
                const isRec = item.category === 'dividen-rec';
                const diff = getDaysDiffFromToday(item.date);

                return (
                  <tr
                    key={item.id}
                    className={`border-b ${style.row} transition-colors group`}
                  >
                    <td className="px-4 py-4 text-center font-black opacity-70">
                      {filteredNonDividen.length + idx + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        <span className="shrink-0 mt-0.5">{style.icon}</span>
                        <div>
                          <span className={`font-black text-sm md:text-base leading-snug block ${isRec ? 'text-white' : 'text-purple-950'}`}>
                            {item.title}
                          </span>
                          {item.notes && (
                            <span className={`text-[11px] mt-0.5 block ${isRec ? 'text-white/80' : 'text-slate-500'}`}>
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className={`text-xs leading-relaxed ${isRec ? 'text-white/90 font-medium' : 'text-slate-700 font-semibold'}`}>
                        {item.desc}
                      </p>
                      {item.legalBasis && (
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${
                          isRec ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {item.legalBasis}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap align-middle">
                      <div className="flex flex-col gap-1">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-extrabold ${style.pill} shadow-xs w-fit`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDateIndonesian(item.date)}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 ${isRec ? 'text-indigo-100' : diff === 0 ? 'text-rose-600' : 'text-purple-700/70'}`}>
                          {diff === 0 ? '● Hari Ini' : diff > 0 ? `${diff} hari lagi` : `${Math.abs(diff)} hari lalu`}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center align-middle no-print">
                      <button
                        onClick={() => handleCopyRow(item)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isRec 
                            ? 'bg-white/20 hover:bg-white/30 text-white border-white/30' 
                            : 'bg-white hover:bg-purple-100 text-purple-700 border-purple-200'
                        }`}
                        title="Salin tanggal dividen ini"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};
