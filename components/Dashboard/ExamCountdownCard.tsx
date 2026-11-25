'use client';

import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { storage, STORAGE_KEYS, DEFAULT_EXAMS, DEFAULT_EXAM_PERIOD } from '@/lib/storage';
import { ExamPaper, UniversityExamPeriod } from '@/lib/types';
import { formatDateDMY, formatTimeRange12h } from '@/lib/timeUtils';

export function ExamCountdownCard() {
  const [exams, setExams] = useState<ExamPaper[]>([]);
  const [period] = useState<UniversityExamPeriod>(DEFAULT_EXAM_PERIOD);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showAllExams, setShowAllExams] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [newExam, setNewExam] = useState<Partial<ExamPaper>>({
    courseCode: '',
    courseName: '',
    examDate: '2026-12-16',
    startTime: '09:00',
    endTime: '12:00',
    venue: 'Exam Hall 1, Level 3',
    seatNumber: '',
  });

  const loadData = () => {
    const list = storage.get<ExamPaper[]>(STORAGE_KEYS.EXAMS, DEFAULT_EXAMS);
    setExams(list);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, []);

  // Sort exams by date/time
  const sortedExams = [...exams].sort((a, b) => {
    const dateA = new Date(`${a.examDate}T${a.startTime || '00:00'}`).getTime();
    const dateB = new Date(`${b.examDate}T${b.startTime || '00:00'}`).getTime();
    return dateA - dateB;
  });

  const nowTime = new Date().getTime();
  const nextExam = sortedExams.find((e) => {
    const examTime = new Date(`${e.examDate}T${e.endTime || '23:59'}`).getTime();
    return examTime > nowTime;
  }) || sortedExams[0];

  // Target time for countdown is nextExam start time, or exam period start
  const targetDateStr = nextExam
    ? `${nextExam.examDate}T${nextExam.startTime || '09:00'}`
    : `${period.startDate}T09:00`;

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const current = new Date().getTime();
      const diff = target - current;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.courseCode?.trim() || !newExam.examDate) return;

    const paper: ExamPaper = {
      id: `exam-${Date.now()}`,
      courseCode: newExam.courseCode.trim(),
      courseName: newExam.courseName?.trim() || newExam.courseCode.trim(),
      examDate: newExam.examDate,
      startTime: newExam.startTime || '09:00',
      endTime: newExam.endTime || '12:00',
      venue: newExam.venue || 'Main Exam Hall',
      seatNumber: newExam.seatNumber || '',
    };

    const updated = [...exams, paper];
    setExams(updated);
    storage.set(STORAGE_KEYS.EXAMS, updated);
    setIsAddOpen(false);
    setNewExam({
      courseCode: '',
      courseName: '',
      examDate: '2026-12-16',
      startTime: '09:00',
      endTime: '12:00',
      venue: 'Exam Hall 1, Level 3',
      seatNumber: '',
    });
  };

  const handleDeleteExam = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this exam paper entry?')) {
      const updated = exams.filter((e) => e.id !== id);
      setExams(updated);
      storage.set(STORAGE_KEYS.EXAMS, updated);
    }
  };

  return (
    <div className="rounded-3xl bg-card border border-border p-5 sm:p-6 shadow-card flex flex-col justify-between min-w-0">
      <div className="min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-xl bg-accent/15 text-accent">
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-fg tracking-wide uppercase">
                Final Exam Countdown & Docket
              </h3>
              <p className="text-xs text-muted">{period.semesterLabel}</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/15 hover:bg-accent text-accent hover:text-accent-fg border border-accent/25 text-xs font-bold transition-all shadow-xs"
          >
            <Plus size={14} />
            <span>Add Paper</span>
          </button>
        </div>

        {/* Big Countdown Timer */}
        <div className="p-4 rounded-2xl bg-bg/70 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} className="text-accent" />
              <span>Time Until {nextExam ? nextExam.courseCode : 'Finals'}</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              Official Schedule
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center mt-3">
            <div className="p-2.5 rounded-xl bg-card border border-border/70 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-fg font-mono block">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted mt-0.5 block">Days</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/70 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-fg font-mono block">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted mt-0.5 block">Hours</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/70 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-fg font-mono block">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted mt-0.5 block">Mins</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/70 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-accent font-mono block">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted mt-0.5 block">Secs</span>
            </div>
          </div>
        </div>

        {/* Next Exam Card */}
        {nextExam ? (
          <div className="mt-3.5 p-4 rounded-2xl bg-accent/10 border border-accent/25">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                Next Upcoming Paper
              </span>
              {nextExam.seatNumber && (
                <span className="text-[11px] font-mono font-bold text-fg bg-card px-2 py-0.5 rounded-md border border-border">
                  Seat: {nextExam.seatNumber}
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-fg mt-2 flex items-center gap-2">
              <span className="font-mono text-accent">{nextExam.courseCode}</span>
              <span className="text-fg truncate">{nextExam.courseName}</span>
            </h4>

            <div className="mt-2.5 space-y-1.5 text-xs text-muted">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-accent shrink-0" />
                <span>
                  Date: <strong className="text-fg">{formatDateDMY(nextExam.examDate)}</strong> ({formatTimeRange12h(nextExam.startTime, nextExam.endTime)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-accent shrink-0" />
                <span className="truncate">Venue: <strong className="text-fg">{nextExam.venue}</strong></span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Expandable All Exams List */}
        {showAllExams && (
          <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 animate-fadeIn">
            {sortedExams.map((exam) => (
              <div
                key={exam.id}
                className="p-3 rounded-xl bg-bg/80 border border-border flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-accent">{exam.courseCode}</span>
                    <span className="font-semibold text-fg">{exam.courseName}</span>
                  </div>
                  <p className="text-[11px] text-muted mt-1">
                    {formatDateDMY(exam.examDate)} • {formatTimeRange12h(exam.startTime, exam.endTime)} • {exam.venue} {exam.seatNumber ? `(Seat: ${exam.seatNumber})` : ''}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteExam(exam.id, e)}
                  className="p-1.5 text-muted hover:text-rose-400 rounded-lg hover:bg-card transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Toggle */}
      <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
        <span className="text-muted text-[11px] flex items-center gap-1">
          <CheckCircle2 size={12} className="text-emerald-700 dark:text-emerald-400" />
          <span>{exams.length} papers scheduled</span>
        </span>

        <button
          onClick={() => setShowAllExams(!showAllExams)}
          className="font-bold text-accent hover:underline flex items-center gap-1"
        >
          <span>{showAllExams ? 'Hide Papers' : 'View All Papers'}</span>
          {showAllExams ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Add Exam Paper Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-fg flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <span>Add Final Examination Paper</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-fg hover:bg-bg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExam} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">
                  Course Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IKB 10304"
                  value={newExam.courseCode}
                  onChange={(e) => setNewExam({ ...newExam, courseCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. IT Security"
                  value={newExam.courseName}
                  onChange={(e) => setNewExam({ ...newExam, courseName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    Exam Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newExam.examDate}
                    onChange={(e) => setNewExam({ ...newExam, examDate: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newExam.startTime}
                    onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newExam.endTime}
                    onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    Exam Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exam Hall 2, Level 3"
                    value={newExam.venue}
                    onChange={(e) => setNewExam({ ...newExam, venue: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    Seat Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. C-12"
                    value={newExam.seatNumber}
                    onChange={(e) => setNewExam({ ...newExam, seatNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-fg bg-bg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow"
                >
                  Save Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
