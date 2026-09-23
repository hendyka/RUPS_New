import React, { useState, useEffect, useMemo } from 'react';
import { 
  DEFAULT_HOLIDAYS_2026, 
  calculateEarliestRupsDate, 
  calculateRupsTimeline, 
  addWorkDays, 
  isWeekendOrHoliday, 
  parseDate, 
  formatDateIso,
  MONTH_MAP 
} from './utils/rupsCalculator';
import { TimelineItem, AlertNotification, ViewMode } from './types';
import { Header } from './components/Header';
import { CalculatorCard } from './components/CalculatorCard';
import { HolidaySidebar } from './components/HolidaySidebar';
import { TimelineTable } from './components/TimelineTable';
import { TimelineVisual } from './components/TimelineVisual';
import { CalendarView } from './components/CalendarView';
import { SingleHtmlModal } from './components/SingleHtmlModal';
import { LegalInfoModal } from './components/LegalInfoModal';
import { 
  Table as TableIcon, 
  GitCommit, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ExternalLink,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function App() {
  // State: Default holidays
  const [holidays, setHolidays] = useState<string[]>(
    () => DEFAULT_HOLIDAYS_2026.map((h) => h.date).sort()
  );

  // State: Default noticeDate = Hari ini (Today)
  const [noticeDate, setNoticeDate] = useState<string>(() => formatDateIso(new Date()));

  // State: Default rupsDate = Prakiraan RUPS Tercepat yang dihitung dari Hari Ini (Today)
  const [rupsDate, setRupsDate] = useState<string>(() => {
    const today = formatDateIso(new Date());
    const initialHols = DEFAULT_HOLIDAYS_2026.map((h) => h.date).sort();
    return calculateEarliestRupsDate(today, initialHols) || today;
  });

  const [showDividen, setShowDividen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alert, setAlert] = useState<AlertNotification | null>(null);
  const [isDateShifted, setIsDateShifted] = useState<boolean>(false);
  const [isSingleHtmlModalOpen, setIsSingleHtmlModalOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const showAlert = (text: string, type: 'success' | 'alert' | 'error' = 'success') => {
    setAlert({ id: String(Date.now()), text, type });
    setTimeout(() => {
      setAlert((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  // Attempt auto-load of /libur-bursa.csv on mount
  useEffect(() => {
    fetch('/libur-bursa.csv')
      .then((res) => {
        if (!res.ok) throw new Error('CSV default not found');
        return res.text();
      })
      .then((csvText) => {
        const lines = csvText.split(/\r?\n/);
        if (lines.length === 0) return;
        const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].toLowerCase().split(delimiter).map((s) => s.trim());
        const tglIdx = headers.indexOf('tgl');
        const bulanIdx = headers.indexOf('bulan');
        const tahunIdx = headers.indexOf('tahun');

        const loadedHolidays: string[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(delimiter).map((c) => c.trim());

          let parsed: string | null = null;
          if (tglIdx > -1 && bulanIdx > -1 && tahunIdx > -1 && cols[tglIdx] && cols[bulanIdx] && cols[tahunIdx]) {
            const day = String(cols[tglIdx]).padStart(2, '0');
            const monthStr = cols[bulanIdx].toLowerCase();
            const monthNum = MONTH_MAP[monthStr] || '01';
            const year = cols[tahunIdx];
            parsed = `${year}-${monthNum}-${day}`;
          } else {
            const match = line.match(/\d{4}-\d{2}-\d{2}/);
            if (match) parsed = match[0];
          }

          if (parsed && /^\d{4}-\d{2}-\d{2}$/.test(parsed) && !loadedHolidays.includes(parsed)) {
            loadedHolidays.push(parsed);
          }
        }

        if (loadedHolidays.length > 0) {
          setHolidays(loadedHolidays.sort());
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_HOLIDAYS_2026 is already loaded
      });
  }, []);

  // Validate RUPS Date against weekends and holidays
  useEffect(() => {
    if (rupsDate && isWeekendOrHoliday(parseDate(rupsDate), holidays)) {
      const shifted = addWorkDays(rupsDate, 0, holidays);
      setRupsDate(shifted);
      setIsDateShifted(true);
      showAlert('Tanggal Acara RUPS otomatis digeser karena jatuh pada Akhir Pekan / Hari Libur Bursa.', 'alert');
    } else {
      setIsDateShifted(false);
    }
  }, [rupsDate, holidays]);

  // Calculations
  const earliestRupsDate = useMemo(() => {
    return calculateEarliestRupsDate(noticeDate, holidays);
  }, [noticeDate, holidays]);

  const timelineItems = useMemo(() => {
    return calculateRupsTimeline(rupsDate, holidays);
  }, [rupsDate, holidays]);

  const handleApplyEarliestRups = () => {
    if (earliestRupsDate) {
      setRupsDate(earliestRupsDate);
      showAlert('Tanggal RUPS berhasil diperbarui sesuai kalkulasi tercepat!', 'success');
    }
  };

  const handleAddHoliday = (date: string) => {
    if (!holidays.includes(date)) {
      setHolidays([...holidays, date].sort());
    }
  };

  const handleRemoveHoliday = (date: string) => {
    setHolidays(holidays.filter((d) => d !== date));
    showAlert('Hari libur bursa berhasil dihapus.', 'success');
  };

  const handleResetHolidays = () => {
    setHolidays(DEFAULT_HOLIDAYS_2026.map((h) => h.date).sort());
    showAlert('Daftar hari libur bursa berhasil direset ke kalender standar 2026.', 'success');
  };

  const handleBatchAddHolidays = (newDates: string[]) => {
    const combined = Array.from(new Set([...holidays, ...newDates])).sort();
    setHolidays(combined);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 font-sans pb-16">
      {/* Toast Notification */}
      {alert && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top duration-300 no-print max-w-md">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs md:text-sm font-bold ${
              alert.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : alert.type === 'alert'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {alert.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : alert.type === 'alert' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="flex-1">{alert.text}</span>
            <button
              onClick={() => setAlert(null)}
              className="p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header */}
        <Header
          timelineItems={timelineItems}
          rupsDate={rupsDate}
          onOpenSingleHtml={() => setIsSingleHtmlModalOpen(true)}
          onOpenLegalGuide={() => setIsLegalModalOpen(true)}
          onShowAlert={showAlert}
        />

        {/* Calculator Bar */}
        <CalculatorCard
          noticeDate={noticeDate}
          onNoticeDateChange={setNoticeDate}
          earliestRupsDate={earliestRupsDate}
          onApplyEarliestRups={handleApplyEarliestRups}
          rupsDate={rupsDate}
          onRupsDateChange={(val) => {
            setRupsDate(val);
            showAlert('Rencana tanggal RUPS berhasil diubah.', 'success');
          }}
          isDateShifted={isDateShifted}
          onQuickPreset={(val) => {
            setRupsDate(val);
            showAlert(`Memilih tanggal preset: ${val}`, 'success');
          }}
        />

        {/* View Mode Tabs & Panel Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-2xl shadow-xs w-fit">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span>Tabel Resmi Kepatuhan</span>
              </button>

              <button
                onClick={() => setViewMode('visual')}
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 ${
                  viewMode === 'visual'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <GitCommit className="w-4 h-4" />
                <span>Alur Visual Stepper</span>
              </button>

              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Matriks Kalender</span>
              </button>
            </div>

            {/* Hide/Show Left Sidebar Toggle Button */}
            <button
              onClick={() => {
                const nextState = !isSidebarOpen;
                setIsSidebarOpen(nextState);
                showAlert(
                  nextState 
                    ? 'Panel Kalender & Libur Bursa dibuka.' 
                    : 'Panel Kalender disembunyikan. Tampilan tabel diperluas.',
                  'success'
                );
              }}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 border shadow-xs ${
                !isSidebarOpen
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-300/50'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isSidebarOpen ? 'Sembunyikan Panel Libur (Perluas Lebar Tabel)' : 'Tampilkan Panel Libur'}
            >
              {isSidebarOpen ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-slate-500" />
                  <span>Sembunyikan Panel Kiri</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-white" />
                  <span>Tampilkan Panel Kiri</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Standar Perhitungan:</span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg font-bold">
              Hari Kerja Bursa & Hari Kalender
            </span>
          </div>
        </div>

        {/* Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar: Holidays & Category info */}
          {isSidebarOpen && (
            <aside className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-200">
              <HolidaySidebar
                holidays={holidays}
                onAddHoliday={handleAddHoliday}
                onRemoveHoliday={handleRemoveHoliday}
                onResetHolidays={handleResetHolidays}
                onBatchAddHolidays={handleBatchAddHolidays}
                onShowAlert={showAlert}
              />
            </aside>
          )}

          {/* Main Area: Active View Mode */}
          <main className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
            {viewMode === 'table' && (
              <TimelineTable
                items={timelineItems}
                showDividen={showDividen}
                onToggleDividen={() => setShowDividen(!showDividen)}
                onShowAlert={showAlert}
                filterCategory={filterCategory}
                onFilterChange={setFilterCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => {
                  const nextState = !isSidebarOpen;
                  setIsSidebarOpen(nextState);
                  showAlert(
                    nextState 
                      ? 'Panel Kalender & Libur Bursa dibuka.' 
                      : 'Panel Kalender disembunyikan. Tampilan tabel diperluas.',
                    'success'
                  );
                }}
              />
            )}

            {viewMode === 'visual' && (
              <TimelineVisual
                items={timelineItems}
                rupsDate={rupsDate}
              />
            )}

            {viewMode === 'calendar' && (
              <CalendarView
                items={timelineItems}
                rupsDate={rupsDate}
                holidayDates={holidays}
              />
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-bold text-slate-600">RUPS Timeline Automation</span> &bull; Dikembangkan untuk Corporate Secretary, Legal, dan Investor Relations Emiten IDX.
          </div>
          <div className="flex items-center gap-1 font-medium">
            Proudly Presented by
            <a
              href="https://www.linkedin.com/in/hendika-listianto-706b27352/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
            >
              hendyka
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <SingleHtmlModal
        isOpen={isSingleHtmlModalOpen}
        onClose={() => setIsSingleHtmlModalOpen(false)}
        rupsDate={rupsDate}
        noticeDate={noticeDate}
        holidayDates={holidays}
        onShowAlert={showAlert}
      />

      <LegalInfoModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
