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
} from 'lucide-react';
import { SemesterAccordion } from '@/components/Results/SemesterAccordion';
import { GradingScaleModal } from '@/components/Results/GradingScaleModal';
import { WhatIfSimulator } from '@/components/Results/WhatIfSimulator';
import { calcCGPA, getAcademicStanding } from '@/lib/grading';
import { DEFAULT_RESULTS, storage, STORAGE_KEYS } from '@/lib/storage';
import { Semester, Subject } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/Auth/AuthProvider';

export default function ResultsPage() {
  const [semesters, setSemesters] = useState<Semester[]>(DEFAULT_RESULTS);
  const [activeTab, setActiveTab] = useState<'history' | 'simulator'>('history');
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadSemesters = async () => {
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
            setSemesters(mapped);
            storage.set(STORAGE_KEYS.RESULTS, mapped);
            return;
          }
        } catch (err) {
          console.warn('Error loading semesters from Supabase:', err);
        }
      }

      const localData = storage.get<Semester[]>(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
      setSemesters(localData);
    };

    loadSemesters();

    const handleUpdate = () => {
      setSemesters(storage.get<Semester[]>(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS));
    };
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, [user]);

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
    <div className="space-y-8 animate-fadeIn pb-14 max-w-6xl mx-auto">
      {/* Top Banner & CGPA Summary */}
      <div className="p-6 sm:p-9 rounded-3xl bg-card border border-border shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap size={160} className="text-accent" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
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
              onClick={handleAddSemester}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all"
            >
              <Plus size={18} />
              <span>Add New Semester</span>
            </button>
          </div>
        </div>

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
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
        <div className="space-y-5">
          {semesters.map((sem, idx) => (
            <SemesterAccordion
              key={sem.id}
              semester={sem}
              semesterIndex={idx}
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
    </div>
  );
}
