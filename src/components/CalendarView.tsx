import React from 'react';
import { TimelineItem } from '../types';
import { formatDateIndonesian, parseDate, formatDateIso } from '../utils/rupsCalculator';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  items: TimelineItem[];
  rupsDate: string;
  holidayDates: string[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ items, rupsDate, holidayDates }) => {
  const initialDate = rupsDate ? parseDate(rupsDate) : new Date();
  const [currentMonth, setCurrentMonth] = React.useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState(initialDate.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Map events by date
  const eventsByDate: Record<string, TimelineItem[]> = {};
  items.forEach((item) => {
    if (!eventsByDate[item.date]) eventsByDate[item.date] = [];
    eventsByDate[item.date].push(item);
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Matriks Kalender Bulanan RUPS</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Melihat penanggalan jadwal RUPS dan dividen dalam kalender bulanan.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-white rounded-xl text-slate-600 transition-colors shadow-xs"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-xs md:text-sm text-slate-800 px-3 min-w-[140px] text-center">
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

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {dayHeaders.map((dh, i) => (
          <div
            key={dh}
            className={`text-center py-2 text-xs font-black uppercase tracking-wider rounded-lg ${
              i === 0 || i === 6 ? 'text-rose-600 bg-rose-50/50' : 'text-slate-500 bg-slate-50'
            }`}
          >
            {dh}
          </div>
        ))}

        {/* Blank days before start */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`blank-${i}`} className="min-h-[75px] md:min-h-[90px] rounded-xl bg-slate-50/30 border border-transparent" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const monthStr = String(currentMonth + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const dateIso = `${currentYear}-${monthStr}-${dayStr}`;

          const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isHoliday = holidayDates.includes(dateIso);
          const events = eventsByDate[dateIso] || [];
          const isHariH = events.some((e) => e.category === 'hari-h');

          return (
            <div
              key={dateIso}
              className={`min-h-[75px] md:min-h-[90px] p-1.5 md:p-2 rounded-xl border flex flex-col justify-between transition-all ${
                isHariH
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                  : events.length > 0
                  ? 'bg-indigo-50/50 border-indigo-200'
                  : isHoliday
                  ? 'bg-rose-50/50 border-rose-200 text-rose-700'
                  : isWeekend
                  ? 'bg-slate-50/70 border-slate-100 text-slate-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black ${isHariH ? 'text-white' : isWeekend || isHoliday ? 'text-rose-600' : 'text-slate-800'}`}>
                  {dayNum}
                </span>
                {isHoliday && !isHariH && (
                  <span className="text-[9px] font-bold text-rose-500 uppercase">Libur</span>
                )}
              </div>

              {/* Event chips */}
              <div className="space-y-1 mt-1 overflow-hidden">
                {events.map((e) => (
                  <div
                    key={e.id}
                    className={`text-[9px] md:text-[10px] font-extrabold px-1.5 py-0.5 rounded truncate ${
                      isHariH
                        ? 'bg-white text-emerald-800'
                        : e.category === 'dividen' || e.category === 'dividen-rec'
                        ? 'bg-purple-100 text-purple-800'
                        : e.category === 'pasca'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
