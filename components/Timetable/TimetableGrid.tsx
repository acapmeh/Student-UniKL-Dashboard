'use client';

import React, { useState } from 'react';
import {
  Plus,
  Clock,
  MapPin,
  User,
  Globe,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { ClassEntry, StudyPlanData } from '@/lib/types';
import { getCardContrastTheme } from '@/lib/colorUtils';
import { formatTimeRange12h } from '@/lib/timeUtils';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import { AddClassModal } from './AddClassModal';
import { StudyPlanModal } from './StudyPlanModal';

interface TimetableGridProps {
  classes: ClassEntry[];
  onSaveClass: (c: ClassEntry) => void;
  onDeleteClass: (id: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Hourly slots extended to 9:00 PM for evening and night classes (12-hour AM/PM labels)
const HOURLY_SLOTS = [
  { label: '8:00 AM – 9:00 AM', start: '08:00', end: '09:00' },
  { label: '9:00 AM – 10:00 AM', start: '09:00', end: '10:00' },
  { label: '10:00 AM – 11:00 AM', start: '10:00', end: '11:00' },
  { label: '11:00 AM – 12:00 PM', start: '11:00', end: '12:00' },
  { label: '12:00 PM – 1:00 PM', start: '12:00', end: '13:00' },
  { label: '1:00 PM – 2:00 PM', start: '13:00', end: '14:00' },
  { label: '2:00 PM – 3:00 PM', start: '14:00', end: '15:00' },
  { label: '3:00 PM – 4:00 PM', start: '15:00', end: '16:00' },
  { label: '4:00 PM – 5:00 PM', start: '16:00', end: '17:00' },
  { label: '5:00 PM – 6:00 PM', start: '17:00', end: '18:00' },
  { label: '6:00 PM – 7:00 PM', start: '18:00', end: '19:00' },
  { label: '7:00 PM – 8:00 PM', start: '19:00', end: '20:00' },
  { label: '8:00 PM – 9:00 PM', start: '20:00', end: '21:00' },
];

const BASE_HOUR = 8;
const ROW_HEIGHT = 100; // 100px per hourly slot
const TOTAL_MINUTES = 13 * 60; // 780 minutes (08:00 to 21:00)

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

interface PositionedClass {
  entry: ClassEntry;
  top: number;
  height: number;
  startMin: number;
  endMin: number;
  colIndex: number;
  totalCols: number;
}

function getPositionedClassesForDay(classes: ClassEntry[], dayIndex: number): PositionedClass[] {
  const dayClasses = classes.filter((c) => c.day === dayIndex);
  if (dayClasses.length === 0) return [];

  // Sort by start time, then duration descending
  const sorted = [...dayClasses].sort((a, b) => {
    const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (diff !== 0) return diff;
    return (
      timeToMinutes(b.endTime) - timeToMinutes(b.startTime) -
      (timeToMinutes(a.endTime) - timeToMinutes(a.startTime))
    );
  });

  const baseMinutes = BASE_HOUR * 60; // 480
  const positioned: PositionedClass[] = sorted.map((c) => {
    const rawStart = timeToMinutes(c.startTime);
    const rawEnd = timeToMinutes(c.endTime);

    const startMin = Math.max(0, rawStart - baseMinutes);
    const endMin = Math.min(TOTAL_MINUTES, Math.max(startMin + 30, rawEnd - baseMinutes));
    const durationMin = Math.max(30, endMin - startMin);

    const top = (startMin / 60) * ROW_HEIGHT + 3;
    const height = Math.max(50, (durationMin / 60) * ROW_HEIGHT - 6);

    return {
      entry: c,
      top,
      height,
      startMin,
      endMin,
      colIndex: 0,
      totalCols: 1,
    };
  });

  // Calculate overlapping groups to share column width side-by-side
  for (let i = 0; i < positioned.length; i++) {
    const cluster = [positioned[i]];
    for (let j = 0; j < positioned.length; j++) {
      if (i !== j) {
        const a = positioned[i];
        const b = positioned[j];
        if (a.startMin < b.endMin && a.endMin > b.startMin) {
          cluster.push(b);
        }
      }
    }

    if (cluster.length > 1) {
      cluster.sort((a, b) => a.startMin - b.startMin);
      const total = cluster.length;
      cluster.forEach((item, idx) => {
        item.colIndex = Math.max(item.colIndex, idx);
        item.totalCols = Math.max(item.totalCols, total);
      });
    }
  }

  return positioned;
}

export function TimetableGrid({ classes, onSaveClass, onDeleteClass }: TimetableGridProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassEntry | null>(null);
  const [studyPlanModalOpen, setStudyPlanModalOpen] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'matrix' | 'daily'>('daily');

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setViewMode('matrix');
    }
    const syncPlan = () => {
      setStudyPlan(storage.get<StudyPlanData | null>(STORAGE_KEYS.STUDY_PLAN, null));
    };
    syncPlan();
    window.addEventListener('dashboard_storage_update', syncPlan);
    return () => window.removeEventListener('dashboard_storage_update', syncPlan);
  }, []);

  const handleSaveStudyPlan = (plan: StudyPlanData) => {
    setStudyPlan(plan);
    storage.set(STORAGE_KEYS.STUDY_PLAN, plan);
  };

  const handleClearStudyPlan = () => {
    setStudyPlan(null);
    storage.remove(STORAGE_KEYS.STUDY_PLAN);
  };

  const handleOpenAdd = () => {
    setEditingClass(null);
    setModalOpen(true);
  };

  const handleEdit = (c: ClassEntry) => {
    setEditingClass(c);
    setModalOpen(true);
  };

  // Group classes by subject code for the bottom overview cards (like Image 2 bottom row)
  const uniqueSubjectsMap = new Map<string, ClassEntry[]>();
  classes.forEach((c) => {
    const key = c.code || c.subject;
    if (!uniqueSubjectsMap.has(key)) {
      uniqueSubjectsMap.set(key, []);
    }
    uniqueSubjectsMap.get(key)!.push(c);
  });
  const uniqueSubjectList = Array.from(uniqueSubjectsMap.entries());

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Schedule Document Canvas (Styled after Image 2) */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-card">
        {/* Top Header Row matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/80">
          {/* Left: Official UniKL Logo & Crest in High-Contrast Container */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-3.5 py-1.5 rounded-2xl shadow-xs border border-white/30 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/unikl-logo-transparent.png"
                alt="Universiti Kuala Lumpur"
                className="h-10 w-auto max-h-10 object-contain"
              />
            </div>
          </div>

          {/* Center: My Weekly Schedule Title in Serif */}
          <div className="text-center md:flex-1">
            <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-fg tracking-tight">
              My Weekly Schedule
            </h1>
            <div className="flex items-center justify-center gap-3 mt-1.5">
              <span className="h-px w-10 bg-accent/60" />
              <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-accent">
                SEMESTER 4 • 2026
              </p>
              <span className="h-px w-10 bg-accent/60" />
            </div>
            <p className="font-serif-title italic text-sm text-muted mt-1">
              Same Goals. A Brighter You.
            </p>
          </div>

          {/* Right: Slogan & Add Button */}
          <div className="flex flex-col items-end gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black tracking-widest text-muted uppercase">
                STUDY • BELONG • ACHIEVE
              </p>
              <div className="h-0.5 w-12 bg-fg/40 ml-auto mt-1" />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStudyPlanModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-bg hover:bg-card-hover text-fg border border-border transition-all"
              >
                <FileText size={16} className="text-accent" />
                <span>Study Plan PDF</span>
                {studyPlan && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-accent/15 text-accent">
                    {studyPlan.subjects.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all"
              >
                <Plus size={18} />
                <span>Add Class</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Study Plan PDF Credit Summary Bar */}
        {studyPlan && (
          <div className="mt-5 p-3.5 sm:px-5 sm:py-3 rounded-2xl bg-bg/80 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5 font-bold text-accent">
                <BookOpen size={14} />
                <span>Study Plan Loaded:</span>
              </span>
              <span className="font-semibold text-fg">{studyPlan.subjects.length} Subjects</span>
              <span className="text-muted">•</span>
              <span className="text-fg">
                Current Sem (ST):{' '}
                <strong className="font-mono text-amber-700 dark:text-amber-400">
                  {studyPlan.currentSemCredits} Credits
                </strong>
              </span>
              <span className="text-muted">•</span>
              <span className="text-fg">
                Completed:{' '}
                <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                  {studyPlan.completedCredits} / {studyPlan.totalCreditToGraduate} Credits
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStudyPlanModalOpen(true)}
              className="inline-flex items-center gap-1 font-bold text-accent hover:underline shrink-0 self-start sm:self-auto"
            >
              <span>Manage PDF</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* View Mode Switcher (Allows Seamless Switching on iPad / Phone / Desktop) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-1">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-bg border border-border shadow-xs">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                viewMode === 'daily'
                  ? 'bg-accent text-accent-fg shadow-glow'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Calendar size={15} />
              <span>Daily Card View</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                viewMode === 'matrix'
                  ? 'bg-accent text-accent-fg shadow-glow'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Layers size={15} />
              <span>Full Weekly Matrix</span>
            </button>
          </div>

          <div className="text-xs text-muted font-medium flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <span>Click any class card or cell to edit</span>
          </div>
        </div>

        {/* 1. Daily Card View */}
        {viewMode === 'daily' && (
          <div className="mt-6">
            <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-bg border border-border mb-5 w-full">
              {DAYS.map((dayName, idx) => {
                const count = classes.filter((c) => c.day === idx).length;
                const isSelected = selectedMobileDay === idx;
                return (
                  <button
                    key={dayName}
                    onClick={() => setSelectedMobileDay(idx)}
                    className={`py-2 px-1 sm:px-3 rounded-xl text-xs font-bold text-center transition-all flex flex-col items-center gap-0.5 sm:gap-1 ${
                      isSelected
                        ? 'bg-accent text-accent-fg shadow-glow'
                        : 'text-muted hover:text-fg'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{dayName.slice(0, 3)}</span>
                    <span className="text-[10px] sm:text-[11px] opacity-80">{count} slots</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile/Tablet Cards for the selected day */}
            <div className="space-y-3.5">
              {classes
                .filter((c) => c.day === selectedMobileDay)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((c) => {
                  const cardTheme = getCardContrastTheme(c.color || '#D4E5FF');
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleEdit(c)}
                      className="cursor-pointer p-5 rounded-2xl border transition-all shadow-sm relative overflow-hidden group hover:scale-[1.01]"
                      style={{
                        backgroundColor: cardTheme.bgHex,
                        color: cardTheme.textColor,
                        borderColor: cardTheme.borderColor,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-base tracking-wide">
                              {c.code || 'SUBJ'}
                            </span>
                            {c.classType && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                style={{ backgroundColor: cardTheme.chipBg }}
                              >
                                {c.classType}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-base mt-1 leading-snug">
                            {c.subject}
                          </h4>
                        </div>

                        <div
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm shrink-0"
                          style={{ backgroundColor: cardTheme.chipBg }}
                        >
                          <Clock size={13} />
                          <span>{formatTimeRange12h(c.startTime, c.endTime)}</span>
                        </div>
                      </div>

                      <div
                        className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-semibold"
                        style={{ borderColor: cardTheme.borderColor, color: cardTheme.mutedColor }}
                      >
                        <div className="flex items-center gap-1.5">
                          {c.isOnline ? (
                            <>
                              <Globe
                                size={14}
                                className={cardTheme.isLightBg ? 'text-blue-700' : 'text-sky-200'}
                              />
                              <span
                                className={`font-bold ${
                                  cardTheme.isLightBg ? 'text-blue-900' : 'text-sky-100'
                                }`}
                              >
                                {c.room}
                              </span>
                            </>
                          ) : (
                            <>
                              <MapPin size={14} />
                              <span>
                                {c.room} •{' '}
                                <strong className={cardTheme.isLightBg ? 'text-emerald-800' : 'text-emerald-200'}>
                                  F2F
                                </strong>
                              </span>
                            </>
                          )}
                        </div>

                        {c.lecturer && (
                          <div className="flex items-center gap-1">
                            <User size={13} />
                            <span>{c.lecturer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {classes.filter((c) => c.day === selectedMobileDay).length === 0 && (
                <div className="py-16 text-center rounded-2xl bg-bg/50 border border-dashed border-border p-6">
                  <p className="font-serif-title italic text-base text-muted">
                    &ldquo;A midweek reset for a brighter finish.&rdquo;
                  </p>
                  <p className="text-xs text-muted mt-2">No classes scheduled on this day.</p>
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-accent text-accent-fg inline-flex items-center gap-1.5"
                  >
                    <Plus size={15} /> Add Class to {DAYS[selectedMobileDay]}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Full Weekly Schedule Grid with strict internal scroll containment */}
        {viewMode === 'matrix' && (
          <div className="mt-6 w-full max-w-full overflow-x-auto pb-4 mx-0">
            <div className="min-w-[840px] rounded-2xl border border-border overflow-hidden bg-bg/40">
          {/* Header Row: Time + 5 Days with Image 2 Colors */}
          <div className="grid grid-cols-12 text-sm font-bold tracking-wider uppercase border-b border-border/80">
            {/* Time Header (Beige/Slate) */}
            <div className="col-span-2 py-4 px-3 text-center bg-[#293548] text-amber-200 border-r border-border/80 font-black tracking-widest text-sm flex items-center justify-center">
              Time
            </div>

            {/* Days Header: Dark Forest Green / Deep Teal as in Image 2 */}
            {DAYS.map((dayName) => (
              <div
                key={dayName}
                className="col-span-2 py-4 px-3 text-center bg-[#152e24] text-emerald-100 font-black border-r border-border/80 last:border-r-0 flex items-center justify-center"
              >
                <span>{dayName}</span>
              </div>
            ))}
          </div>

          {/* Timetable Hourly Matrix with Multi-Hour Continuous Spanning */}
          <div className="grid grid-cols-12 divide-x divide-border/60">
            {/* Time Label Column (Left) */}
            <div className="col-span-2 divide-y divide-border/60 bg-card/60">
              {HOURLY_SLOTS.map((slot) => (
                <div
                  key={slot.label}
                  className="h-[100px] py-3 px-1.5 flex items-start justify-center font-mono font-semibold text-[10px] sm:text-[11px] text-muted whitespace-nowrap"
                >
                  {slot.label}
                </div>
              ))}
            </div>

            {/* 5 Days Columns */}
            {DAYS.map((_, dayIndex) => {
              const positioned = getPositionedClassesForDay(classes, dayIndex);
              const isWednesday = dayIndex === 2;
              const hasNoClassesOnDay = classes.filter((c) => c.day === dayIndex).length === 0;

              return (
                <div key={dayIndex} className="col-span-2 relative h-[1300px]">
                  {/* Background hourly gridlines */}
                  <div className="absolute inset-0 divide-y divide-border/60 pointer-events-none">
                    {HOURLY_SLOTS.map((slot) => (
                      <div
                        key={slot.label}
                        className="h-[100px] bg-card/10 hover:bg-card/25 transition-colors"
                      />
                    ))}
                  </div>

                  {/* Midweek Reset Quote for Empty Day (Image 2 style) */}
                  {isWednesday && hasNoClassesOnDay && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none text-center">
                      <p className="font-serif-title italic text-xs text-muted/80 leading-relaxed">
                        A midweek reset for a brighter finish.
                      </p>
                    </div>
                  )}

                  {/* Multi-hour class cards */}
                  {positioned.map((item) => {
                    const colWidth = 100 / item.totalCols;
                    const leftPercent = item.colIndex * colWidth;
                    const cardTheme = getCardContrastTheme(item.entry.color || '#FFD5DC');

                    return (
                      <div
                        key={item.entry.id}
                        onClick={() => handleEdit(item.entry)}
                        className="absolute cursor-pointer p-3 rounded-xl border transition-all shadow-sm hover:shadow-md hover:scale-[1.01] hover:z-20 flex flex-col justify-between overflow-hidden"
                        style={{
                          top: `${item.top}px`,
                          height: `${item.height}px`,
                          left: `calc(${leftPercent}% + 4px)`,
                          width: `calc(${colWidth}% - 8px)`,
                          backgroundColor: cardTheme.bgHex,
                          color: cardTheme.textColor,
                          borderColor: cardTheme.borderColor,
                        }}
                      >
                        <div>
                          {/* Code Subject in bold */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-black text-sm tracking-wide leading-none">
                              {item.entry.code || 'CODE'}
                            </span>
                          </div>

                          {/* Class Type & Name Subject */}
                          <div className="mt-1">
                            <p className="font-extrabold text-xs leading-tight">
                              {item.entry.classType || 'Class'}
                            </p>
                            <p
                              className="text-[11px] font-semibold line-clamp-2 mt-0.5 leading-snug"
                              style={{ color: cardTheme.mutedColor }}
                            >
                              {item.entry.subject}
                            </p>
                          </div>
                        </div>

                        <div
                          className="mt-2 pt-2 border-t space-y-1 text-[11px] font-semibold"
                          style={{ borderColor: cardTheme.borderColor, color: cardTheme.mutedColor }}
                        >
                          {/* Time */}
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="shrink-0" />
                            <span className="truncate">
                              {formatTimeRange12h(item.entry.startTime, item.entry.endTime)}
                            </span>
                          </div>

                          {/* Venue / Online */}
                          <div className="flex items-center gap-1 truncate">
                            {item.entry.isOnline ? (
                              <>
                                <Globe
                                  size={11}
                                  className={`shrink-0 ${cardTheme.isLightBg ? 'text-blue-700' : 'text-sky-200'}`}
                                />
                                <span
                                  className={`truncate font-bold ${
                                    cardTheme.isLightBg ? 'text-blue-900' : 'text-sky-100'
                                  }`}
                                >
                                  {item.entry.room}
                                </span>
                              </>
                            ) : (
                              <>
                                <MapPin size={11} className="shrink-0" />
                                <span className="truncate">{item.entry.room} (F2F)</span>
                              </>
                            )}
                          </div>

                          {/* Lecturer */}
                          {item.entry.lecturer && (
                            <div className="flex items-center gap-1 truncate text-[10px]">
                              <User size={10} className="shrink-0" />
                              <span className="truncate">{item.entry.lecturer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}

        {/* Bottom Section below Timetable: Course Detail Cards Strip (Image 2 bottom row) */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-accent" />
            <h3 className="font-bold text-base text-fg">Enrolled Course Details</h3>
            <span className="text-xs text-muted">
              ({uniqueSubjectList.length} Unique Subjects)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueSubjectList.map(([code, subClasses]) => {
              const primary = subClasses[0];
              const uniqueLecturers = Array.from(new Set(subClasses.map((s) => s.lecturer))).join(', ');
              const hasOnline = subClasses.some((s) => s.isOnline);
              const cardTheme = getCardContrastTheme(primary.color || '#FFD5DC');

              return (
                <div
                  key={code}
                  className="p-5 rounded-2xl border transition-all shadow-sm relative overflow-hidden"
                  style={{
                    backgroundColor: cardTheme.bgHex,
                    color: cardTheme.textColor,
                    borderColor: cardTheme.borderColor,
                  }}
                >
                  <div
                    className="flex items-center justify-between pb-2 border-b"
                    style={{ borderColor: cardTheme.borderColor }}
                  >
                    <span className="font-mono font-black text-base">
                      {code}
                    </span>
                    {hasOnline && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                        <Globe size={10} /> Online
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm mt-2 leading-snug">
                    {primary.subject}
                  </h4>

                  <div className="mt-3 space-y-1.5 text-xs" style={{ color: cardTheme.mutedColor }}>
                    {subClasses.map((session) => (
                      <div
                        key={session.id}
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: cardTheme.chipBg }}
                      >
                        <div className="font-bold" style={{ color: cardTheme.textColor }}>
                          {session.classType || 'Session'}: {DAYS[session.day]}, {formatTimeRange12h(session.startTime, session.endTime)}
                        </div>
                        <div className="text-[11px] flex items-center gap-1 mt-0.5">
                          {session.isOnline ? (
                            <Globe size={11} className={cardTheme.isLightBg ? 'text-blue-700' : 'text-sky-200'} />
                          ) : (
                            <MapPin size={11} />
                          )}
                          <span>Location: {session.room} {session.isOnline ? '(Online)' : '(F2F)'}</span>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 text-[11px] flex items-center gap-1">
                      <User size={12} />
                      <span>Lecturer: <strong style={{ color: cardTheme.textColor }}>{uniqueLecturers || 'Not specified'}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Signature: Calendar badge & Script "Progress Lives Here." (Image 2 bottom right) */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted uppercase">
            <Calendar size={15} className="text-accent" />
            <span>UNIVERSITI KUALA LUMPUR • AUTUMN 2026</span>
          </div>

          <div className="font-handwriting text-3xl sm:text-4xl text-accent font-bold tracking-wide">
            Progress Lives Here.
          </div>
        </div>
      </div>

      {/* Add / Edit Class Modal */}
      <AddClassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveClass}
        onDelete={onDeleteClass}
        existingClasses={classes}
        editingClass={editingClass}
      />

      {/* Study Plan PDF Upload & Viewer Modal */}
      <StudyPlanModal
        isOpen={studyPlanModalOpen}
        onClose={() => setStudyPlanModalOpen(false)}
        studyPlan={studyPlan}
        onSavePlan={handleSaveStudyPlan}
        onClearPlan={handleClearStudyPlan}
      />
    </div>
  );
}
