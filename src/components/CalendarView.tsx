import React, { useState, useMemo } from 'react';
import { TimelineItem, HolidayItem } from '../types';
import { formatDateIndonesian, parseDate, formatDateIso, DEFAULT_HOLIDAYS_2026 } from '../utils/rupsCalculator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Info, 
  Sparkles,
  CalendarCheck2
} from 'lucide-react';

interface CalendarViewProps {
  items: TimelineItem[];
  rupsDate: string;
  holidayDates: string[];
  holidays?: HolidayItem[];
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

interface HoveredDateInfo {
  dateIso: string;
  holiday?: HolidayItem;
  events: TimelineItem[];
  isCutiBersama: boolean;
  rect: DOMRect;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  items, 
  rupsDate, 
  holidayDates,
  holidays = DEFAULT_HOLIDAYS_2026,
  isSidebarOpen = true,
  onToggleSidebar
}) => {
  const initialDate = rupsDate ? parseDate(rupsDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [hoveredDateInfo, setHoveredDateInfo] = useState<HoveredDateInfo | null>(null);

  // Map holidays by ISO date
  const holidayMap = useMemo(() => {
    const map: Record<string, HolidayItem> = {};
    // First map from DEFAULT_HOLIDAYS_2026
    DEFAULT_HOLIDAYS_2026.forEach((h) => {
      map[h.date] = h;
    });
    // Overlay custom/loaded holidays
    if (holidays && holidays.length > 0) {
      holidays.forEach((h) => {
        map[h.date] = h;
      });
    }
    // Also cover any dates in holidayDates that might not be in the list
    holidayDates.forEach((d) => {
      if (!map[d]) {
        map[d] = { date: d, name: 'Libur Bursa' };
      }
    });
    return map;
  }, [holidays, holidayDates]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setHoveredDateInfo(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setHoveredDateInfo(null);
  };

  const jumpToRupsMonth = () => {
    if (rupsDate) {
      const d = parseDate(rupsDate);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
      setHoveredDateInfo(null);
    }
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setHoveredDateInfo(null);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayHeaders = [
    { label: 'Min', full: 'Minggu', isWeekend: true },
    { label: 'Sen', full: 'Senin', isWeekend: false },
    { label: 'Sel', full: 'Selasa', isWeekend: false },
    { label: 'Rab', full: 'Rabu', isWeekend: false },
    { label: 'Kam', full: 'Kamis', isWeekend: false },
    { label: 'Jum', full: 'Jumat', isWeekend: false },
    { label: 'Sab', full: 'Sabtu', isWeekend: true },
  ];

  // Map events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, TimelineItem[]> = {};
    items.forEach((item) => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [items]);

  // Count holidays and events in this current viewed month
  const monthStats = useMemo(() => {
    let holidayCount = 0;
    let cutiBersamaCount = 0;
    let eventCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateIso = `${currentYear}-${monthStr}-${dayStr}`;
      
      const hol = holidayMap[dateIso];
      if (hol) {
        if (hol.name.toLowerCase().includes('cuti bersama')) {
          cutiBersamaCount++;
        } else {
          holidayCount++;
        }
      }
      if (eventsByDate[dateIso]) {
        eventCount += eventsByDate[dateIso].length;
      }
    }
    return { holidayCount, cutiBersamaCount, eventCount };
  }, [currentYear, currentMonth, daysInMonth, holidayMap, eventsByDate]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 md:p-8 space-y-6 relative">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
              Matriks Kalender Bulanan RUPS
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium pl-11">
            Penanggalan jadwal RUPS, hari libur nasional, dan cuti bersama bursa efek (data: libur-bursa.csv).
          </p>
        </div>

        {/* Action Buttons & Month Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick jump buttons */}
          <button
            onClick={jumpToToday}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors"
            title="Lompat ke bulan saat ini"
          >
            Hari Ini
          </button>
          {rupsDate && (
            <button
              onClick={jumpToRupsMonth}
              className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-[11px] font-bold text-indigo-700 flex items-center gap-1 transition-colors"
              title="Lompat ke bulan pelaksanaan RUPS"
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Bulan RUPS</span>
            </button>
          )}

          {/* Toggle Sidebar Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
              title={isSidebarOpen ? 'Sembunyikan panel samping untuk memperlebar matriks kalender' : 'Tampilkan panel samping'}
            >
              {isSidebarOpen ? (
                <>
                  <PanelLeftClose className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Perlebar Tampilan</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Tampilkan Panel</span>
                </>
              )}
            </button>
          )}

          {/* Month Navigator */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-xs ml-auto sm:ml-0">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-white rounded-xl text-slate-600 transition-colors shadow-xs"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-black text-xs md:text-sm text-slate-800 px-3 min-w-[130px] md:min-w-[150px] text-center select-none">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-white rounded-xl text-slate-600 transition-colors shadow-xs"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Summary Micro-Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Bulan {monthNames[currentMonth]}:</span>
        {monthStats.holidayCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
            {monthStats.holidayCount} Libur Bursa
          </span>
        )}
        {monthStats.cutiBersamaCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            {monthStats.cutiBersamaCount} Cuti Bersama
          </span>
        )}
        {monthStats.eventCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
            {monthStats.eventCount} Agenda RUPS
          </span>
        )}
        {monthStats.holidayCount === 0 && monthStats.cutiBersamaCount === 0 && (
          <span className="text-[11px] text-slate-400 font-semibold italic">Tidak ada hari libur bursa di bulan ini.</span>
        )}
      </div>

      {/* Calendar Matrix Grid */}
      <div className="select-none">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2">
          {dayHeaders.map((dh) => (
            <div
              key={dh.label}
              className={`text-center py-2 text-[11px] md:text-xs font-black uppercase tracking-wider rounded-xl transition-colors ${
                dh.isWeekend ? 'text-rose-600 bg-rose-50/60 border border-rose-100' : 'text-slate-600 bg-slate-50 border border-slate-200/60'
              }`}
            >
              <span className="hidden md:inline">{dh.full}</span>
              <span className="md:hidden">{dh.label}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {/* Blank padding days for first week */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div 
              key={`blank-${i}`} 
              className="min-h-[90px] sm:min-h-[105px] md:min-h-[118px] rounded-2xl bg-slate-50/40 border border-dashed border-slate-200/50" 
            />
          ))}

          {/* Active days in this month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const monthStr = String(currentMonth + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateIso = `${currentYear}-${monthStr}-${dayStr}`;

            const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const holiday = holidayMap[dateIso];
            const isHoliday = Boolean(holiday);
            const isCutiBersama = Boolean(holiday?.name.toLowerCase().includes('cuti bersama'));
            const events = eventsByDate[dateIso] || [];
            const isHariH = events.some((e) => e.category === 'hari-h');
            const isToday = formatDateIso(new Date()) === dateIso;

            const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
              if (isHoliday || events.length > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredDateInfo({
                  dateIso,
                  holiday,
                  events,
                  isCutiBersama,
                  rect
                });
              }
            };

            const handleMouseLeave = () => {
              setHoveredDateInfo(null);
            };

            return (
              <div
                key={dateIso}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleMouseEnter}
                className={`relative min-h-[90px] sm:min-h-[105px] md:min-h-[118px] p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-start gap-1 transition-all duration-150 cursor-default ${
                  isHariH
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 z-10'
                    : isHoliday
                    ? isCutiBersama
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950 hover:border-amber-300 hover:shadow-xs'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950 hover:border-rose-300 hover:shadow-xs'
                    : events.length > 0
                    ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300 hover:shadow-xs'
                    : isWeekend
                    ? 'bg-slate-50/60 border-slate-100 text-slate-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Cell Header: Day Number & Holiday Tag */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span 
                      className={`text-xs md:text-sm font-black leading-none ${
                        isHariH 
                          ? 'text-white' 
                          : isToday
                          ? 'text-indigo-600 underline decoration-indigo-400 underline-offset-2'
                          : isWeekend || isHoliday 
                          ? 'text-rose-600' 
                          : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-indigo-100 text-indigo-700">
                        Kini
                      </span>
                    )}
                  </div>

                  {/* Micro badge indicator on header */}
                  {isHoliday && !isHariH && (
                    <span 
                      className={`text-[8.5px] md:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md leading-none border shrink-0 ${
                        isCutiBersama 
                          ? 'bg-amber-100/90 text-amber-900 border-amber-300/80' 
                          : 'bg-rose-100/90 text-rose-800 border-rose-300/80'
                      }`}
                      title={holiday?.name}
                    >
                      {isCutiBersama ? 'CB' : 'Libur'}
                    </span>
                  )}
                </div>

                {/* Holiday Name Pill / Card (Fits cleanly in the box) */}
                {isHoliday && !isHariH && (
                  <div
                    className={`w-full px-1.5 py-1 rounded-lg border text-left leading-snug transition-colors ${
                      isCutiBersama
                        ? 'bg-white/80 hover:bg-white text-amber-900 border-amber-200/80'
                        : 'bg-white/80 hover:bg-white text-rose-900 border-rose-200/80'
                    }`}
                    title={`${isCutiBersama ? 'Cuti Bersama' : 'Libur Bursa'}: ${holiday?.name} (${formatDateIndonesian(dateIso)})`}
                  >
                    <p className="text-[9.5px] sm:text-[10px] font-bold line-clamp-2 break-words">
                      {holiday?.name}
                    </p>
                  </div>
                )}

                {/* RUPS Events Chips */}
                {events.length > 0 && (
                  <div className="space-y-1 w-full mt-auto">
                    {events.map((e) => {
                      const isEventHariH = e.category === 'hari-h';
                      const isDividen = e.category === 'dividen' || e.category === 'dividen-rec';
                      const isPasca = e.category === 'pasca';

                      return (
                        <div
                          key={e.id}
                          className={`w-full text-[9px] sm:text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md truncate transition-all ${
                            isEventHariH
                              ? 'bg-white text-emerald-900 shadow-xs'
                              : isDividen
                              ? 'bg-purple-100/90 text-purple-900 border border-purple-200 hover:bg-purple-200'
                              : isPasca
                              ? 'bg-amber-100/90 text-amber-900 border border-amber-200 hover:bg-amber-200'
                              : 'bg-blue-100/90 text-blue-900 border border-blue-200 hover:bg-blue-200'
                          }`}
                          title={`${e.title} - ${e.desc}`}
                        >
                          {e.title}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Floating Hover Pop-Up (jika disorot / disentuh) */}
      {hoveredDateInfo && (
        <div
          style={{
            position: 'fixed',
            left: Math.max(16, Math.min(window.innerWidth - 330, hoveredDateInfo.rect.left + hoveredDateInfo.rect.width / 2 - 150)),
            top: hoveredDateInfo.rect.top > 240 
              ? Math.max(12, hoveredDateInfo.rect.top - 10) 
              : Math.min(window.innerHeight - 200, hoveredDateInfo.rect.bottom + 10),
            transform: hoveredDateInfo.rect.top > 240 ? 'translateY(-100%)' : 'translateY(0)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
          className="w-[300px] sm:w-[320px] bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Badge & Date */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            {hoveredDateInfo.holiday ? (
              <span 
                className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  hoveredDateInfo.isCutiBersama 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {hoveredDateInfo.isCutiBersama ? '🏖️ Cuti Bersama Bursa' : '🔴 Libur Bursa Efek'}
              </span>
            ) : (
              <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                📅 Agenda RUPS
              </span>
            )}

            <span className="text-[10.5px] font-semibold text-slate-400">
              {formatDateIndonesian(hoveredDateInfo.dateIso)}
            </span>
          </div>

          {/* Holiday Content */}
          {hoveredDateInfo.holiday && (
            <div className="mt-2.5 space-y-1.5">
              <h4 className="text-xs md:text-sm font-black text-white leading-snug">
                {hoveredDateInfo.holiday.name}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Perdagangan saham BEI ditiadakan. Hari ini tidak dihitung sebagai hari bursa aktif dalam batas waktu pelaksanaan tahapan RUPS.
              </p>
              <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1 font-medium">
                <Info className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Sumber: libur-bursa.csv resmi</span>
              </div>
            </div>
          )}

          {/* Associated RUPS Events if any */}
          {hoveredDateInfo.events.length > 0 && (
            <div className={`space-y-2 ${hoveredDateInfo.holiday ? 'mt-3 pt-2.5 border-t border-slate-800' : 'mt-2.5'}`}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Agenda RUPS Terjadwal ({hoveredDateInfo.events.length}):
              </div>
              {hoveredDateInfo.events.map((e) => (
                <div key={e.id} className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between gap-2">
                    <span className="truncate">{e.title}</span>
                    {e.category === 'hari-h' && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-white shrink-0">
                        Hari-H
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-slate-300 leading-tight">
                    {e.desc}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Color Legend Card */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-300 inline-block" />
            <span className="font-bold text-slate-700">Libur Bursa Nasional</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300 inline-block" />
            <span className="font-bold text-slate-700">Cuti Bersama Bursa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 border border-emerald-700 inline-block shadow-xs" />
            <span className="font-bold text-slate-900">Pelaksanaan RUPS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-100 border border-blue-300 inline-block" />
            <span className="font-semibold text-slate-600">Pra / Pasca RUPS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-100 border border-purple-300 inline-block" />
            <span className="font-semibold text-slate-600">Dividen Tunai</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Sorot kotak tanggal untuk melihat detail lengkap hari libur.
        </div>
      </div>
    </div>
  );
};
