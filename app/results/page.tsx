'use client';

import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  HelpCircle,
  RotateCcw,
  Calculator,
  Sparkles,
  History,
  FileText,
  BookOpen,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { SemesterAccordion } from '@/components/Results/SemesterAccordion';
import { GradingScaleModal } from '@/components/Results/GradingScaleModal';
import { WhatIfSimulator } from '@/components/Results/WhatIfSimulator';
import { StudyPlanModal } from '@/components/Timetable/StudyPlanModal';
import { calcCGPA, getAcademicStanding } from '@/lib/grading';
import { buildSemestersFromStudyPlan } from '@/lib/studyPlanHelper';
import { DEFAULT_RESULTS, storage, STORAGE_KEYS } from '@/lib/storage';
import { Semester, StudyPlanData, Subject } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/Auth/AuthProvider';

export default function ResultsPage() {
  const [semesters, setSemesters] = useState<Semester[]>(DEFAULT_RESULTS);
  const [activeTab, setActiveTab] = useState<'history' | 'simulator'>('history');
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [studyPlanModalOpen, setStudyPlanModalOpen] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const syncSemestersCloud = async (userId: string, list: Semester[]) => {
      try {
        await supabase.from('semesters').delete().eq('user_id', userId);
        if (list.length > 0) {
          await supabase.from('semesters').upsert(
            list.map((sem) => ({
              id: sem.id,
              user_id: userId,
              name: sem.name,
              subjects: sem.subjects,
            }))
          );
        }
      } catch (err) {
        console.warn('Error syncing semesters to Supabase:', err);
      }
    };

    const loadSemesters = async () => {
      const localData = storage.get<Semester[]>(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
      const savedPlan = storage.get<StudyPlanData | null>(STORAGE_KEYS.STUDY_PLAN, null);
      const hasLocalStudyPlanSemesters =
        Boolean(savedPlan) && localData.some((s) => s.id.startsWith('sp-sem-'));

      if (user) {
        try {
          const { data, error } = await supabase
            .from('semesters')
            .select('*')
            .eq('user_id', user.id);

          if (data && !error && data.length > 0) {
            interface DbSemester {
              id: string;
              name: string;
              subjects?: Subject[];
            }
            const mapped: Semester[] = (data as unknown as DbSemester[]).map((d) => ({
              id: d.id,
              name: d.name,
              subjects: Array.isArray(d.subjects) ? d.subjects : [],
            }));
            const cloudHasStudyPlan = mapped.some((s) => s.id.startsWith('sp-sem-'));
            if (hasLocalStudyPlanSemesters && !cloudHasStudyPlan) {
              // Keep freshly synced Study Plan semesters from /timetable and push them up
              setSemesters(localData);
              void syncSemestersCloud(user.id, localData);
              return;
            }
            setSemesters(mapped);
            storage.set(STORAGE_KEYS.RESULTS, mapped);
            return;
          }
        } catch (err) {
          console.warn('Error loading semesters from Supabase:', err);
        }
      }

      setSemesters(localData);
    };

    loadSemesters();

    const syncAll = () => {
      setSemesters(storage.get<Semester[]>(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS));
      setStudyPlan(storage.get<StudyPlanData | null>(STORAGE_KEYS.STUDY_PLAN, null));
    };
    setStudyPlan(storage.get<StudyPlanData | null>(STORAGE_KEYS.STUDY_PLAN, null));
    window.addEventListener('dashboard_storage_update', syncAll);
    return () => window.removeEventListener('dashboard_storage_update', syncAll);
  }, [user]);

  const syncSemestersToCloud = async (synced: Semester[], replaceAll = false) => {
    if (!user) return;
    try {
      if (replaceAll) {
        await supabase.from('semesters').delete().eq('user_id', user.id);
      }
      for (const sem of synced) {
        await supabase.from('semesters').upsert({
          id: sem.id,
          user_id: user.id,
          name: sem.name,
          subjects: sem.subjects,
        });
      }
    } catch (err) {
      console.error('Failed to sync semesters to Supabase:', err);
    }
  };

  const handleSaveStudyPlan = (plan: StudyPlanData) => {
    setStudyPlan(plan);
    storage.set(STORAGE_KEYS.STUDY_PLAN, plan);
  };

  const handleClearStudyPlan = () => {
    setStudyPlan(null);
    storage.remove(STORAGE_KEYS.STUDY_PLAN);
  };

  const handleSyncedResults = (synced: Semester[]) => {
    setSemesters(synced);
    setSyncNotice(`Auto-synced ${synced.length} completed semesters from Study Plan PDF!`);
    setTimeout(() => setSyncNotice(null), 5000);
    void syncSemestersToCloud(synced, true);
  };

  const handleResyncFromPlan = () => {
    if (!studyPlan) return;
    const synced = buildSemestersFromStudyPlan(studyPlan, semesters);
    if (synced.length === 0) {
      setSyncNotice('No completed (PASS / CT) subjects found in the uploaded Study Plan.');
      setTimeout(() => setSyncNotice(null), 4000);
      return;
    }
    setSemesters(synced);
    storage.set(STORAGE_KEYS.RESULTS, synced);
    handleSyncedResults(synced);
  };

  const stats = calcCGPA(semesters);
  const standing = getAcademicStanding(stats.cgpa);

  const handleUpdateSemester = async (updated: Semester) => {
    const next = semesters.map((s) => (s.id === updated.id ? updated : s));
    setSemesters(next);
    storage.set(STORAGE_KEYS.RESULTS, next);

    if (user) {
      try {
        await supabase.from('semesters').upsert({
          id: updated.id,
          user_id: user.id,
          name: updated.name,
          subjects: updated.subjects,
        });
      } catch (err) {
        console.error('Failed to sync semester to Supabase:', err);
      }
    }
  };

  const handleDeleteSemester = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this semester and its subjects?')) {
      const next = semesters.filter((s) => s.id !== id);
      setSemesters(next);
      storage.set(STORAGE_KEYS.RESULTS, next);

      if (user) {
        try {
          await supabase.from('semesters').delete().eq('id', id);
        } catch (err) {
          console.error('Failed to delete semester from Supabase:', err);
        }
      }
    }
  };

  const handleAddSemester = () => {
    const nextIndex = semesters.length + 1;
    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      name: `Semester ${nextIndex}`,
      subjects: [
        {
          id: `sub-${Date.now()}-1`,
          code: '',
          name: 'Core Subject 1',
          creditHours: 3,
          grade: 'A',
        },
      ],
    };
    const next = [...semesters, newSem];
    setSemesters(next);
    storage.set(STORAGE_KEYS.RESULTS, next);
  };

  const handleReset = () => {
    if (window.confirm('Reset results back to UniKL sample semester data?')) {
      setSemesters(DEFAULT_RESULTS);
      storage.set(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-14 w-full min-w-0 max-w-6xl mx-auto overflow-x-hidden">
      {/* Top Banner & CGPA Summary */}
      <div className="p-4 sm:p-9 rounded-3xl bg-card border border-border shadow-card relative overflow-hidden w-full min-w-0">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap size={160} className="text-accent" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 min-w-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {/* UniKL Official Logo strictly from User's 2nd reference picture */}
              <div className="flex items-center mr-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/unikl-official-logo-badge.png"
                  alt="UniKL Official Logo"
                  className="h-7 w-auto object-contain rounded-md shadow-xs border border-white/10"
                />
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-bold border border-accent/30 flex items-center gap-1.5">
                <Calculator size={14} />
                Official Academic Grading
              </span>

              <button
                onClick={() => setIsScaleModalOpen(true)}
                className="text-xs text-muted hover:text-fg underline flex items-center gap-1 font-medium transition-colors"
              >
                <HelpCircle size={14} />
                View Grade Scale & Points
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-fg tracking-tight">
              Academic Results & CGPA Calculator
            </h1>
            <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
              Enter your subjects, credit hours, and grades for each semester. Your semester GPA and overall cumulative CGPA recalculate automatically in real-time.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStudyPlanModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-bg hover:bg-card-hover text-fg border border-border transition-all"
            >
              <FileText size={17} className="text-accent" />
              <span>Study Plan PDF</span>
              {studyPlan && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-accent/15 text-accent">
                  {studyPlan.subjects.length}
                </span>
              )}
            </button>

            <button
              onClick={handleAddSemester}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all"
            >
              <Plus size={18} />
              <span>Add New Semester</span>
            </button>
          </div>
        </div>

        {/* Auto-Detected Study Plan Sync Bar */}
        {studyPlan && (
          <div className="mt-6 p-3.5 sm:px-5 sm:py-3 rounded-2xl bg-bg/80 border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs relative z-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5 font-bold text-accent">
                <BookOpen size={14} />
                <span>Study Plan Auto-Detected:</span>
              </span>
              <span className="font-semibold text-fg">{studyPlan.subjects.length} Subjects</span>
              <span className="text-muted">•</span>
              <span className="text-fg">
                Completed:{' '}
                <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                  {studyPlan.completedCredits} / {studyPlan.totalCreditToGraduate} Cr
                </strong>
              </span>
              <span className="text-muted">•</span>
              <span className="text-fg">
                Current Sem (ST):{' '}
                <strong className="font-mono text-amber-700 dark:text-amber-400">
                  {studyPlan.currentSemCredits} Cr
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleResyncFromPlan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 font-bold hover:opacity-90 transition-opacity"
              >
                <RefreshCw size={12} />
                <span>Sync Completed Semesters</span>
              </button>
              <button
                type="button"
                onClick={() => setStudyPlanModalOpen(true)}
                className="font-bold text-accent hover:underline"
              >
                Manage PDF
              </button>
            </div>
          </div>
        )}

        {syncNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 text-xs font-bold flex items-center gap-2 relative z-10">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-7 border-t border-border">
          <div className="p-5 rounded-2xl bg-bg/80 border border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Cumulative CGPA
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-accent">
                {stats.cgpa !== null ? stats.cgpa.toFixed(2) : '—'}
              </span>
              <span className="text-sm text-muted font-bold">/ 4.00</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-bg/80 border border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Academic Standing
            </span>
            <div className={`text-base sm:text-lg font-black mt-2 truncate ${standing.colorClass}`}>
              {standing.text}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-bg/80 border border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Graded Credits
            </span>
            <div className="text-3xl sm:text-4xl font-black text-fg mt-2">
              {stats.totalGradedCreditsAll}
              <span className="text-xs sm:text-sm text-muted font-normal ml-1.5">
                ({stats.totalCreditHoursAll} total)
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-bg/80 border border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Semesters
            </span>
            <div className="text-3xl sm:text-4xl font-black text-fg mt-2">
              {stats.totalSemesters}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher between Semester History & What-If Simulator */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-card border border-border w-full sm:w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:flex-initial justify-center flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-accent text-accent-fg shadow-xs'
              : 'text-muted hover:text-fg'
          }`}
        >
          <History size={16} />
          <span>Semester Grade Records</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 sm:flex-initial justify-center flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'simulator'
              ? 'bg-accent text-accent-fg shadow-xs'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Sparkles size={16} />
          <span>&ldquo;What-If&rdquo; CGPA Simulator</span>
        </button>
      </div>

      {activeTab === 'simulator' ? (
        <WhatIfSimulator />
      ) : (
        /* Semesters List */
        <div className="space-y-5 w-full min-w-0">
          {semesters.map((sem, idx) => (
            <SemesterAccordion
              key={sem.id}
              semester={sem}
              semesterIndex={idx}
              studyPlan={studyPlan}
              onUpdateSemester={handleUpdateSemester}
              onDeleteSemester={handleDeleteSemester}
            />
          ))}

          {semesters.length === 0 && (
            <div className="py-20 text-center rounded-3xl bg-card border border-dashed border-border p-8">
              <GraduationCap size={48} className="mx-auto text-muted mb-3 opacity-50" />
              <h3 className="font-bold text-fg text-lg">No semesters added yet</h3>
              <p className="text-sm text-muted mt-1 max-w-md mx-auto">
                Start by adding your first semester, then enter your subjects and grades to calculate your CGPA.
              </p>
              <button
                onClick={handleAddSemester}
                className="mt-5 px-6 py-3 rounded-2xl text-sm font-bold bg-accent text-accent-fg inline-flex items-center gap-2"
              >
                <Plus size={18} /> Add First Semester
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer info & Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted pt-2">
        <p>Changes are saved to your browser automatically on every edit.</p>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 hover:text-fg font-medium transition-colors"
        >
          <RotateCcw size={14} /> Reset to Sample Semesters
        </button>
      </div>

      {/* Grading Scale Modal */}
      <GradingScaleModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
      />

      {/* Shared Single-Upload Study Plan PDF Modal */}
      <StudyPlanModal
        isOpen={studyPlanModalOpen}
        onClose={() => setStudyPlanModalOpen(false)}
        studyPlan={studyPlan}
        onSavePlan={handleSaveStudyPlan}
        onClearPlan={handleClearStudyPlan}
        onSyncedResults={handleSyncedResults}
      />
    </div>
  );
}
