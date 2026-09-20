import React from 'react';
import { TimelineItem } from '../types';
import { formatDateIndonesian, getDaysDiffFromToday } from '../utils/rupsCalculator';
import { CheckCircle, Clock, Calendar, FileText, AlertCircle, Coins } from 'lucide-react';

interface TimelineVisualProps {
  items: TimelineItem[];
  rupsDate: string;
}

export const TimelineVisual: React.FC<TimelineVisualProps> = ({ items, rupsDate }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
          Visual Stepper & Alur Tahapan RUPS
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Visualisasi progres tahapan dari Pra-RUPS, Hari Pelaksanaan, Pasca-RUPS, hingga Dividen Tunai.
        </p>
      </div>

      <div className="relative pl-6 md:pl-10 space-y-8 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {items.map((item, index) => {
          const diff = getDaysDiffFromToday(item.date);
          const isPast = diff < 0;
          const isToday = diff === 0;
          const isHariH = item.category === 'hari-h';
          const isDividen = item.category === 'dividen' || item.category === 'dividen-rec';

          let iconBg = 'bg-blue-600 text-white';
          if (isHariH) iconBg = 'bg-emerald-600 text-white ring-4 ring-emerald-100';
          else if (item.category === 'pasca') iconBg = 'bg-amber-500 text-white';
          else if (isDividen) iconBg = 'bg-purple-600 text-white';

          return (
            <div key={item.id} className="relative group">
              {/* Milestone Icon */}
              <div
                className={`absolute -left-[31px] md:-left-[39px] top-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-110 ${iconBg}`}
              >
                {isPast ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Content Card */}
              <div
                className={`p-4 md:p-5 rounded-2xl border transition-all ${
                  isHariH
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-md'
                    : isToday
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/40'
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isHariH
                          ? 'bg-white/20 text-white'
                          : isDividen
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <h3 className={`font-black text-sm md:text-base ${isHariH ? 'text-white' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                        isHariH ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDateIndonesian(item.date)}</span>
                    </div>
                  </div>
                </div>

                <p className={`text-xs mt-2 leading-relaxed ${isHariH ? 'text-white/90 font-medium' : 'text-slate-600 font-medium'}`}>
                  {item.desc}
                </p>

                {item.legalBasis && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isHariH ? 'bg-white/15 text-white' : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      Dasar Hukum: {item.legalBasis}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isHariH ? 'text-emerald-200' : isToday ? 'text-rose-600 font-extrabold' : 'text-slate-400'
                      }`}
                    >
                      {isToday ? '● HARI INI' : diff > 0 ? `${diff} hari lagi` : `${Math.abs(diff)} hari lalu`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
