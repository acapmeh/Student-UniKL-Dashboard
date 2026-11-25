'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle, Clock, MapPin, BookOpen, User, Globe, Search } from 'lucide-react';
import { ClassEntry, ClassType, StudyPlanData, StudyPlanSubject } from '@/lib/types';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import { SUBJECT_COLOR_PRESETS } from '@/lib/colorUtils';
import { SubjectColorPicker } from './SubjectColorPicker';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classEntry: ClassEntry) => void;
  onDelete?: (id: string) => void;
  existingClasses: ClassEntry[];
  editingClass?: ClassEntry | null;
}

const CLASS_TYPES: ClassType[] = ['Lecture', 'Tutorial', 'Computer Lab', 'Workshop', 'Studio'];

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
];

export function AddClassModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingClasses,
  editingClass,
}: AddClassModalProps) {
  const [code, setCode] = useState('');
  const [subject, setSubject] = useState('');
  const [classType, setClassType] = useState<ClassType>('Lecture');
  const [lecturer, setLecturer] = useState('');
  const [room, setRoom] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [day, setDay] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [startTime, setStartTime] = useState('10:30');
  const [endTime, setEndTime] = useState('12:30');
  const [color, setColor] = useState(SUBJECT_COLOR_PRESETS[0].hex);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [planSearch, setPlanSearch] = useState('');
  const [selectedPlanCode, setSelectedPlanCode] = useState('CUSTOM');

  useEffect(() => {
    const plan = storage.get<StudyPlanData | null>(STORAGE_KEYS.STUDY_PLAN, null);
    setStudyPlan(plan);
    setPlanSearch('');

    if (editingClass) {
      setCode(editingClass.code || '');
      setSubject(editingClass.subject);
      setClassType(editingClass.classType || 'Lecture');
      setLecturer(editingClass.lecturer || '');
      setRoom(editingClass.room || '');
      setIsOnline(Boolean(editingClass.isOnline));
      setDay(editingClass.day);
      setStartTime(editingClass.startTime);
      setEndTime(editingClass.endTime);
      setColor(editingClass.color || SUBJECT_COLOR_PRESETS[0].hex);
      const norm = (editingClass.code || '').replace(/\s+/g, '').toUpperCase();
      const matched = plan?.subjects.find((s) => s.code.replace(/\s+/g, '').toUpperCase() === norm);
      setSelectedPlanCode(matched ? matched.code : 'CUSTOM');
    } else {
      setCode('');
      setSubject('');
      setClassType('Lecture');
      setLecturer('');
      setRoom('');
      setIsOnline(false);
      setDay(0);
      setStartTime('10:30');
      setEndTime('12:30');
      setColor(SUBJECT_COLOR_PRESETS[Math.floor(Math.random() * SUBJECT_COLOR_PRESETS.length)].hex);
      setSelectedPlanCode('CUSTOM');
    }
    setConflictError(null);
  }, [editingClass, isOpen]);

  const groupedPlanSubjects = useMemo(() => {
    const list = studyPlan?.subjects ?? [];
    const q = planSearch.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
        )
      : list;

    const st: StudyPlanSubject[] = [];
    const remaining: StudyPlanSubject[] = [];
    const completed: StudyPlanSubject[] = [];

    for (const s of filtered) {
      const status = s.status.toUpperCase();
      if (status === 'ST') st.push(s);
      else if (status === 'PASS' || status === 'CT' || status === 'EX') completed.push(s);
      else remaining.push(s);
    }

    return { st, remaining, completed, totalMatches: filtered.length };
  }, [studyPlan, planSearch]);

  const matchedPlanSubject = useMemo(() => {
    if (!studyPlan?.subjects?.length || !code.trim()) return null;
    const norm = code.replace(/\s+/g, '').toUpperCase();
    return (
      studyPlan.subjects.find((s) => s.code.replace(/\s+/g, '').toUpperCase() === norm) ?? null
    );
  }, [studyPlan, code]);

  if (!isOpen) return null;

  const checkForCollision = (): boolean => {
    if (startTime >= endTime) {
      setConflictError('End time must be after start time.');
      return true;
    }

    const otherClasses = existingClasses.filter((c) =>
      editingClass ? c.id !== editingClass.id : true
    );

    const collision = otherClasses.find((c) => {
      if (c.day !== day) return false;
      return startTime < c.endTime && endTime > c.startTime;
    });

    if (collision) {
      setConflictError(
        `Time collision: Overlaps with "${collision.code ? collision.code + ' - ' : ''}${collision.subject}" (${collision.startTime} - ${collision.endTime}).`
      );
      return true;
    }

    setConflictError(null);
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setConflictError('Please enter subject name.');
      return;
    }
    if (!room.trim() && !isOnline) {
      setConflictError('Please enter class venue or check Online Class.');
      return;
    }

    if (checkForCollision()) {
      return;
    }

    const newEntry: ClassEntry = {
      id: editingClass ? editingClass.id : `class-${Date.now()}`,
      code: code.trim().toUpperCase(),
      subject: subject.trim(),
      classType,
      lecturer: lecturer.trim() || 'Not Specified',
      room: isOnline ? (room.trim() || 'Online Class (MS Teams / Zoom)') : room.trim(),
      isOnline,
      day,
      startTime,
      endTime,
      color,
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-fg">
                {editingClass ? 'Edit Schedule Slot' : 'Add Class to Weekly Schedule'}
              </h2>
              <p className="text-xs text-muted">Enter subject code, name, lecturer & venue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-fg hover:bg-card-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body with larger inputs */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-sm">
          {conflictError && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          {/* Study Plan Grouped Searchable Subject Dropdown */}
          {studyPlan && studyPlan.subjects.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-bg/80 border border-border space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="study-plan-subject-select"
                  className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5"
                >
                  <BookOpen size={13} />
                  <span>Select Subject from Study Plan PDF</span>
                </label>
                {matchedPlanSubject && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                    {matchedPlanSubject.creditHours} Credits • {matchedPlanSubject.status}
                  </span>
                )}
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  placeholder="Quick search code or subject (e.g. EHB, Security)..."
                  aria-label="Filter Study Plan subjects"
                  className="w-full pl-8 pr-20 py-2 rounded-xl bg-card border border-border focus:border-accent text-fg text-xs outline-none"
                />
                {planSearch.trim() && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted font-medium">
                    {groupedPlanSubjects.totalMatches} found
                  </span>
                )}
              </div>

              <select
                id="study-plan-subject-select"
                value={selectedPlanCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPlanCode(val);
                  if (val === 'CUSTOM') return;
                  const found = studyPlan.subjects.find((s) => s.code === val);
                  if (found) {
                    setCode(found.code);
                    setSubject(found.name);
                    setConflictError(null);
                  }
                }}
                className="w-full max-w-full min-w-0 px-3 py-2.5 rounded-xl bg-card border border-border focus:border-accent text-fg text-xs sm:text-sm font-semibold outline-none cursor-pointer"
              >
                <option value="CUSTOM">Custom / Manual Entry (type below)</option>
                {groupedPlanSubjects.st.length > 0 && (
                  <optgroup label="★ Current Semester (ST)">
                    {groupedPlanSubjects.st.map((s) => (
                      <option key={`st-${s.rowNumber}-${s.code}`} value={s.code}>
                        {`${s.code} — ${s.name} (${s.creditHours} Cr)`}
                      </option>
                    ))}
                  </optgroup>
                )}
                {groupedPlanSubjects.remaining.length > 0 && (
                  <optgroup label="Remaining / Upcoming Subjects">
                    {groupedPlanSubjects.remaining.map((s) => (
                      <option key={`rem-${s.rowNumber}-${s.code}`} value={s.code}>
                        {`${s.code} — ${s.name} (${s.creditHours} Cr)`}
                      </option>
                    ))}
                  </optgroup>
                )}
                {groupedPlanSubjects.completed.length > 0 && (
                  <optgroup label="Completed (PASS / CT)">
                    {groupedPlanSubjects.completed.map((s) => (
                      <option key={`done-${s.rowNumber}-${s.code}`} value={s.code}>
                        {`${s.code} — ${s.name} (${s.creditHours} Cr)`}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          {/* Code Subject & Name Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Code Subject <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSD 201"
                value={code}
                onChange={(e) => {
                  const nextCode = e.target.value.toUpperCase();
                  setCode(nextCode);
                  setConflictError(null);
                  const norm = nextCode.replace(/\s+/g, '');
                  const found = studyPlan?.subjects.find(
                    (s) => s.code.replace(/\s+/g, '').toUpperCase() === norm
                  );
                  setSelectedPlanCode(found ? found.code : 'CUSTOM');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg font-mono uppercase font-bold text-sm outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Name Subject <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures & Algorithms"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold placeholder:text-muted/60 outline-none transition-colors"
              />
            </div>
          </div>

          {(!studyPlan || studyPlan.subjects.length === 0) && (
            <p className="text-[11px] text-muted">
              Tip: Upload your UniKL Study Plan PDF on the Timetable page to unlock subject auto-fill dropdown.
            </p>
          )}

          {/* Class Type & Lecturer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Class Type
              </label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value as ClassType)}
                className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-medium outline-none cursor-pointer"
              >
                {CLASS_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-card text-fg">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-accent" /> Who is the Lecturer
              </label>
              <input
                type="text"
                placeholder="e.g. Ts. Dr. Rahim / Madam Faridah"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm placeholder:text-muted/60 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Venue & Online Mode Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                {isOnline ? <Globe size={13} className="text-sky-400" /> : <MapPin size={13} className="text-accent" />}
                {isOnline ? 'Online Platform' : 'Class Venue (F2F)'} <span className="text-rose-400">*</span>
              </label>

              {/* Online toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-fg">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => {
                    setIsOnline(e.target.checked);
                    if (e.target.checked && !room) {
                      setRoom('Online Class (MS Teams)');
                    }
                  }}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span className={isOnline ? 'text-accent font-bold' : 'text-muted font-bold'}>
                  {isOnline ? '🌐 Online Class' : '🏫 F2F Class'}
                </span>
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={isOnline ? 'e.g. Online Class (MS Teams / Zoom)' : 'e.g. 0.17 Lecture Theatre / Lab 4'}
                value={room}
                onChange={(e) => {
                  setRoom(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm placeholder:text-muted/60 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Day & Time Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Day of Week
              </label>
              <select
                value={day}
                onChange={(e) => {
                  setDay(Number(e.target.value) as 0 | 1 | 2 | 3 | 4);
                  setConflictError(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none cursor-pointer"
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value} className="bg-card text-fg">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1">
                <Clock size={12} /> Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1">
                <Clock size={12} /> End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono outline-none transition-colors"
              />
            </div>
          </div>

          {/* Subject Color Theme & Custom Picture-4 Style Picker */}
          <SubjectColorPicker value={color} onChange={setColor} />

          {/* Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            {editingClass && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingClass.id);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Delete Slot
              </button>
            ) : <div />}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-fg hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all"
              >
                {editingClass ? 'Save Changes' : 'Add to Schedule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
