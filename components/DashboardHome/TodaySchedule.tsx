'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, MapPin, User, ChevronRight, PlusCircle, CheckCircle2, Globe } from 'lucide-react';
import { DEFAULT_TIMETABLE, storage, STORAGE_KEYS } from '@/lib/storage';
import { ClassEntry } from '@/lib/types';
import { formatTimeRange12h } from '@/lib/timeUtils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function TodaySchedule() {
  const [classes, setClasses] = useState<ClassEntry[]>(DEFAULT_TIMETABLE);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [isRealToday, setIsRealToday] = useState(true);

  useEffect(() => {
    const data = storage.get<ClassEntry[]>(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE);
    setClasses(data);

    const jsDay = new Date().getDay();
    const calculatedDayIndex = jsDay === 0 ? 6 : jsDay - 1;
    if (calculatedDayIndex > 4) {
      setSelectedDay(0);
      setIsRealToday(false);
    } else {
      setSelectedDay(calculatedDayIndex);
      setIsRealToday(true);
    }

    const handleUpdate = () => {
      setClasses(storage.get<ClassEntry[]>(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE));
    };
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, []);

  const dayClasses = classes
    .filter((c) => c.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-glow" />
            <h2 className="text-xl font-bold text-fg">
              {isRealToday && selectedDay === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
                ? "Today's Schedule"
                : `${DAYS[selectedDay]}'s Schedule`}
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-bg border border-border text-muted font-bold">
              {dayClasses.length} {dayClasses.length === 1 ? 'Slot' : 'Slots'}
            </span>
          </div>
          <p className="text-sm text-muted mt-1 font-medium">
            Subject code, lecturer & venue at a glance
          </p>
        </div>

        {/* Day switch pills */}
        <div className="grid grid-cols-5 sm:flex sm:items-center gap-1 sm:gap-1.5 bg-bg p-1 sm:p-1.5 rounded-2xl border border-border w-full sm:w-auto">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((dayName, idx) => {
            const count = classes.filter((c) => c.day === idx).length;
            const isSelected = selectedDay === idx;
            return (
              <button
                key={dayName}
                onClick={() => setSelectedDay(idx)}
                className={`px-1.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 sm:gap-1.5 ${
                  isSelected
                    ? 'bg-accent text-accent-fg shadow-glow font-extrabold'
                    : 'text-muted hover:text-fg hover:bg-card-hover'
                }`}
              >
                <span>{dayName}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] sm:text-[11px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      isSelected ? 'bg-black/25 text-accent-fg' : 'bg-card text-muted'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Class List */}
      <div className="mt-6 space-y-3.5">
        {dayClasses.length === 0 ? (
          <div className="py-14 px-4 text-center rounded-2xl bg-bg/50 border border-dashed border-border">
            <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mx-auto text-accent mb-3">
              <CheckCircle2 size={26} />
            </div>
            <h3 className="font-bold text-fg text-base">No classes scheduled for {DAYS[selectedDay]}</h3>
            <p className="font-serif-title italic text-sm text-muted max-w-sm mx-auto mt-1">
              &ldquo;A midweek reset for a brighter finish.&rdquo;
            </p>
            <Link
              href="/timetable"
              className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all"
            >
              <PlusCircle size={15} /> Add to Schedule
            </Link>
          </div>
        ) : (
          dayClasses.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-bg/80 hover:bg-bg border border-border hover:border-accent/40 transition-all duration-200 gap-4"
            >
              {/* Left Accent Bar */}
              <div
                className="absolute left-0 top-3.5 bottom-3.5 w-1.5 rounded-r-full"
                style={{ backgroundColor: item.color || 'var(--color-accent)' }}
              />

              <div className="pl-3.5 flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                {/* Time Badge */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-fg bg-card px-3 py-1.5 rounded-xl border border-border self-start">
                  <Clock size={14} className="text-accent" />
                  <span>
                    {formatTimeRange12h(item.startTime, item.endTime)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.code && (
                      <span className="font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-md bg-card text-accent border border-accent/25 shrink-0">
                        {item.code}
                      </span>
                    )}
                    <h3 className="font-extrabold text-fg text-sm sm:text-base group-hover:text-accent transition-colors leading-snug break-words">
                      {item.subject}
                    </h3>
                    {item.classType && (
                      <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-md bg-bg text-muted font-bold shrink-0">
                        {item.classType}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs sm:text-sm text-muted font-medium">
                    <span className="flex items-center gap-1.5">
                      {item.isOnline ? (
                        <>
                          <Globe size={14} className="text-sky-400 shrink-0" />
                          <span className="text-sky-400 font-bold">{item.room}</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={14} className="text-accent shrink-0" />
                          <span>Venue: {item.room} (F2F)</span>
                        </>
                      )}
                    </span>

                    {item.lecturer && (
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="shrink-0" />
                        <span>Lecturer: <strong>{item.lecturer}</strong></span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span
                className="self-end sm:self-auto text-xs px-3 py-1.5 rounded-xl font-bold"
                style={{
                  backgroundColor: `${item.color || '#3B82F6'}25`,
                  color: item.color || '#3B82F6',
                }}
              >
                {item.isOnline ? 'Online' : 'F2F'}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
        <span className="text-xs sm:text-sm text-muted">Weekly full schedule format</span>
        <Link
          href="/timetable"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-accent hover:underline"
        >
          Open Weekly Timetable <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
