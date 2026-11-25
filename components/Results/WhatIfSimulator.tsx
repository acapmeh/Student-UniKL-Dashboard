'use client';

import React, { useEffect, useState } from 'react';
import {
  Calculator,
  Sparkles,
  Award,
  CheckCircle,
  Plus,
  Trash2,
  Sliders,
} from 'lucide-react';
import { Grade } from '@/lib/types';
import { gradeToPoint } from '@/lib/grading';
import { storage, STORAGE_KEYS, DEFAULT_RESULTS, DEFAULT_TIMETABLE, DEFAULT_PROFILE } from '@/lib/storage';

interface SimulatedSubject {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  grade: Grade;
}

export function WhatIfSimulator() {
  const [currentCgpa, setCurrentCgpa] = useState<number>(3.75);
  const [currentCredits, setCurrentCredits] = useState<number>(45);
  const [targetCgpa, setTargetCgpa] = useState<number>(3.85);

  const [subjects, setSubjects] = useState<SimulatedSubject[]>([
    { id: 'sim-1', code: 'CSD 201', name: 'Data Structures & Algorithms', creditHours: 3, grade: 'A' },
    { id: 'sim-2', code: 'IKB 10304', name: 'IT Security', creditHours: 3, grade: 'A' },
    { id: 'sim-3', code: 'BUS 201', name: 'Technopreneurship & Management', creditHours: 3, grade: 'A-' },
    { id: 'sim-4', code: 'INE 301', name: 'Innovation & Entrepreneurship', creditHours: 3, grade: 'A-' },
  ]);

  // Load real current results & profile
  useEffect(() => {
    const semesters = storage.get(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
    const profile = storage.get(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    if (profile.targetCgpa) {
      setTargetCgpa(profile.targetCgpa);
    }

    let totalPoints = 0;
    let totalGradedCreds = 0;

    for (const sem of semesters) {
      for (const sub of sem.subjects) {
        const pt = gradeToPoint(sub.grade);
        const cred = Number(sub.creditHours) || 0;
        if (pt !== null && cred > 0 && sub.grade !== 'S' && sub.grade !== 'I') {
          totalGradedCreds += cred;
          totalPoints += cred * pt;
        }
      }
    }

    if (totalGradedCreds > 0) {
      setCurrentCredits(totalGradedCreds);
      setCurrentCgpa(Number((totalPoints / totalGradedCreds).toFixed(2)));
    }

    // Try to load subjects from timetable classes to auto-populate
    const timetable = storage.get(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE);
    const uniqueCodes = Array.from(new Set(timetable.map((c) => c.code)));
    if (uniqueCodes.length > 0) {
      const mapped: SimulatedSubject[] = uniqueCodes.map((code, idx) => {
        const classObj = timetable.find((c) => c.code === code);
        return {
          id: `sim-tt-${idx}`,
          code: code,
          name: classObj?.subject || code,
          creditHours: 3,
          grade: 'A',
        };
      });
      setSubjects(mapped);
    }
  }, []);

  // Compute Current Points
  const currentTotalPoints = currentCredits * currentCgpa;

  // Compute Simulated Semester Quality Points & Credits
  let simSemesterCredits = 0;
  let simSemesterPoints = 0;

  subjects.forEach((s) => {
    const cred = Number(s.creditHours) || 0;
    const pt = gradeToPoint(s.grade);
    if (pt !== null && cred > 0) {
      simSemesterCredits += cred;
      simSemesterPoints += cred * pt;
    }
  });

  const simulatedSemesterGpa =
    simSemesterCredits > 0
      ? Number((simSemesterPoints / simSemesterCredits).toFixed(2))
      : 0;

  const newTotalCredits = currentCredits + simSemesterCredits;
  const newTotalPoints = currentTotalPoints + simSemesterPoints;
  const projectedCgpa =
    newTotalCredits > 0
      ? Number((newTotalPoints / newTotalCredits).toFixed(2))
      : currentCgpa;

  const cgpaDelta = Number((projectedCgpa - currentCgpa).toFixed(2));
  const diffToTarget = Number((projectedCgpa - targetCgpa).toFixed(2));

  // Quick Preset Handlers
  const handleSetAllGrades = (grade: Grade) => {
    setSubjects(subjects.map((s) => ({ ...s, grade })));
  };

  const handleAddSubject = () => {
    const newSub: SimulatedSubject = {
      id: `sim-${Date.now()}`,
      code: 'NEW 101',
      name: 'Elective Subject',
      creditHours: 3,
      grade: 'A',
    };
    setSubjects([...subjects, newSub]);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const gradesList: Grade[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'];

  return (
    <div className="space-y-6">
      {/* Simulation Results Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Calculator size={160} className="text-accent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-bold border border-accent/30 flex items-center gap-1.5">
              <Sparkles size={14} />
              Interactive Academic Forecasting
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-fg tracking-tight">
            &ldquo;What-If&rdquo; CGPA Target Simulator
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl">
            Simulate your expected grades for current enrolled courses to preview your projected Semester GPA and new cumulative CGPA.
          </p>

          {/* Key Metrics Display */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Current Baseline */}
            <div className="p-4 rounded-2xl bg-bg/80 border border-border">
              <span className="text-[11px] font-bold uppercase text-muted">Current CGPA</span>
              <p className="text-2xl font-black text-fg font-mono mt-1">
                {currentCgpa.toFixed(2)}
              </p>
              <span className="text-[11px] text-muted">{currentCredits} graded credits</span>
            </div>

            {/* Projected Semester GPA */}
            <div className="p-4 rounded-2xl bg-bg/80 border border-border">
              <span className="text-[11px] font-bold uppercase text-muted">Projected Sem GPA</span>
              <p className="text-2xl font-black text-accent font-mono mt-1">
                {simulatedSemesterGpa.toFixed(2)}
              </p>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {simulatedSemesterGpa >= 3.5 ? "★ Dean's List Pace" : 'Good Standing'}
              </span>
            </div>

            {/* New Cumulative CGPA */}
            <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-accent">New Cumulative CGPA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl sm:text-3xl font-black text-fg font-mono">
                  {projectedCgpa.toFixed(2)}
                </p>
                <span
                  className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-md ${
                    cgpaDelta >= 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400'
                  }`}
                >
                  {cgpaDelta >= 0 ? `+${cgpaDelta.toFixed(2)}` : cgpaDelta.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] text-muted">
                {newTotalCredits} total credits
              </span>
            </div>

            {/* Target CGPA Progress */}
            <div className="p-4 rounded-2xl bg-bg/80 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-muted">Goal ({targetCgpa.toFixed(2)})</span>
                <Award size={14} className="text-accent" />
              </div>
              <div className="mt-2">
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, (projectedCgpa / targetCgpa) * 100))}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-semibold mt-2 text-fg">
                {diffToTarget >= 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={12} /> Goal Achieved! (+{diffToTarget.toFixed(2)})
                  </span>
                ) : (
                  <span className="text-amber-700 dark:text-amber-400">
                    {Math.abs(diffToTarget).toFixed(2)} points to target
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-accent" />
          <span className="text-xs font-bold text-fg">Quick Grade Presets:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSetAllGrades('A')}
            className="px-3 py-1.5 rounded-xl bg-bg hover:bg-card-hover border border-border text-fg text-xs font-bold transition-colors"
          >
            All Straight A&apos;s (4.00)
          </button>
          <button
            onClick={() => handleSetAllGrades('A-')}
            className="px-3 py-1.5 rounded-xl bg-bg hover:bg-card-hover border border-border text-fg text-xs font-bold transition-colors"
          >
            All A- (3.67)
          </button>
          <button
            onClick={() => handleSetAllGrades('B+')}
            className="px-3 py-1.5 rounded-xl bg-bg hover:bg-card-hover border border-border text-fg text-xs font-bold transition-colors"
          >
            All B+ (3.33)
          </button>
          <button
            onClick={handleAddSubject}
            className="px-3 py-1.5 rounded-xl bg-accent text-accent-fg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
          >
            <Plus size={14} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Course List & Grade Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Simulated Courses ({subjects.length} subjects • {simSemesterCredits} credits)
          </span>
          <span className="text-xs text-muted">Select expected grade for each subject</span>
        </div>

        {subjects.map((sub, index) => {
          const currentPoint = gradeToPoint(sub.grade) || 0;

          return (
            <div
              key={sub.id}
              className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-accent/40 shadow-xs transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-bg border border-border flex items-center justify-center text-xs font-bold text-muted font-mono">
                    {index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent">
                        {sub.code}
                      </span>
                      <h4 className="text-sm font-bold text-fg">{sub.name}</h4>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 bg-bg px-2.5 py-1 rounded-xl border border-border text-xs">
                    <span className="text-muted font-semibold">Credits:</span>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={sub.creditHours}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 1;
                        setSubjects(
                          subjects.map((s) =>
                            s.id === sub.id ? { ...s, creditHours: val } : s
                          )
                        );
                      }}
                      className="w-8 font-bold text-fg bg-transparent text-center font-mono outline-none"
                    />
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-accent/15 text-accent border border-accent/25">
                    {sub.grade} ({currentPoint.toFixed(2)})
                  </span>

                  {subjects.length > 1 && (
                    <button
                      onClick={() => handleRemoveSubject(sub.id)}
                      className="p-1.5 text-muted hover:text-rose-400 rounded-lg hover:bg-bg transition-colors"
                      title="Remove course"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Grade Selector Pills (Wraps cleanly without horizontal scroll) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-0.5">
                {gradesList.map((g) => {
                  const isSelected = sub.grade === g;
                  return (
                    <button
                      key={g}
                      onClick={() =>
                        setSubjects(
                          subjects.map((s) => (s.id === sub.id ? { ...s, grade: g } : s))
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                        isSelected
                          ? 'bg-accent text-accent-fg shadow-xs scale-105'
                          : 'bg-bg hover:bg-card-hover border border-border text-muted hover:text-fg'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
