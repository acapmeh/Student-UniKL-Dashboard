'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, BookCheck, Calculator, ChevronRight, TrendingUp, Sparkles, X } from 'lucide-react';
import { calcCGPA, getAcademicStanding } from '@/lib/grading';
import { DEFAULT_RESULTS, storage, STORAGE_KEYS } from '@/lib/storage';
import { Semester } from '@/lib/types';
import { WhatIfSimulator } from '@/components/Results/WhatIfSimulator';

interface CgpaCardProps {
  layout?: 'strip' | 'grid';
}

export function CgpaCard({ layout = 'grid' }: CgpaCardProps) {
  const [semesters, setSemesters] = useState<Semester[]>(DEFAULT_RESULTS);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  useEffect(() => {
    const s = storage.get<Semester[]>(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
    setSemesters(s);

    const handleUpdate = () => {
      setSemesters(storage.get<Semester[]>(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS));
    };
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, []);

  const stats = calcCGPA(semesters);
  const standing = getAcademicStanding(stats.cgpa);
  const totalSubjects = semesters.reduce((acc, sem) => acc + sem.subjects.length, 0);

  if (layout === 'grid') {
    return (
      <>
        <div className="flex flex-col gap-5 h-full justify-between">
          {/* Primary CGPA Display Card */}
          <div className="flex-1 rounded-3xl bg-gradient-to-br from-card via-card to-card-hover border border-border p-6 sm:p-7 flex flex-col justify-between shadow-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Award size={120} className="text-accent" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Calculator size={16} className="text-accent" />
                  Cumulative CGPA
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSimulatorOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/20 hover:bg-accent text-accent hover:text-accent-fg border border-accent/30 font-bold text-xs transition-colors shadow-xs"
                    title="Simulate expected grades for this semester"
                  >
                    <Sparkles size={12} />
                    <span>What-If Simulator</span>
                  </button>
                  <span className={`text-xs px-3 py-1 rounded-full bg-bg border border-border font-bold ${standing.colorClass}`}>
                    {standing.text}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-fg">
                  {stats.cgpa !== null ? stats.cgpa.toFixed(2) : '—'}
                </span>
                <span className="text-lg font-bold text-muted">/ 4.00</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-muted font-medium leading-relaxed">
                Based on <span className="text-fg font-bold">{stats.totalGradedCreditsAll}</span> graded credits across{' '}
                <span className="text-fg font-bold">{stats.totalSemesters}</span> semesters
              </div>
              <Link
                href="/results"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-accent hover:underline self-end sm:self-auto shrink-0"
              >
                Manage Results <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* 2 Stats Cards Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Credits Card */}
            <div className="rounded-3xl bg-card border border-border p-5 sm:p-6 flex flex-col justify-between shadow-card">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Total Credits</span>
                <div className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center text-accent">
                  <BookCheck size={18} />
                </div>
              </div>

              <div className="my-2.5">
                <div className="text-3xl sm:text-4xl font-black text-fg">{stats.totalCreditHoursAll}</div>
                <p className="text-xs text-muted mt-0.5 font-medium">Credit hours completed</p>
              </div>

              <div className="text-xs text-muted flex items-center gap-1.5 font-medium">
                <TrendingUp size={13} className="text-emerald-400" />
                <span>Includes transfer & non-graded</span>
              </div>
            </div>

            {/* Courses Enrolled Card */}
            <div className="rounded-3xl bg-card border border-border p-5 sm:p-6 flex flex-col justify-between shadow-card">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Courses Taken</span>
                <div className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center text-accent">
                  <Award size={18} />
                </div>
              </div>

              <div className="my-2.5">
                <div className="text-3xl sm:text-4xl font-black text-fg">{totalSubjects}</div>
                <p className="text-xs text-muted mt-0.5 font-medium">Total subjects recorded</p>
              </div>

              <div className="text-xs text-muted flex items-center gap-1.5 font-medium">
                <span className="text-accent font-bold">{semesters.length}</span>
                <span>academic semesters</span>
              </div>
            </div>
          </div>
        </div>

        {/* What-If Simulator Modal */}
        {isSimulatorOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-card border border-border rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Academic Forecast Tool
                </span>
                <button
                  onClick={() => setIsSimulatorOpen(false)}
                  className="p-1 rounded-xl text-muted hover:text-fg hover:bg-bg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <WhatIfSimulator />

              <div className="pt-3 border-t border-border flex justify-end">
                <button
                  onClick={() => setIsSimulatorOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Strip layout fallback
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="sm:col-span-2 rounded-3xl bg-gradient-to-br from-card via-card to-card-hover border border-border p-6 sm:p-7 flex flex-col justify-between shadow-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award size={120} className="text-accent" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Calculator size={16} className="text-accent" />
                Cumulative CGPA
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/20 hover:bg-accent text-accent hover:text-accent-fg border border-accent/30 font-bold text-xs transition-colors shadow-xs"
                >
                  <Sparkles size={12} />
                  <span>Simulate</span>
                </button>
                <span className={`text-xs px-3 py-1 rounded-full bg-bg border border-border font-bold ${standing.colorClass}`}>
                  {standing.text}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-fg">
                {stats.cgpa !== null ? stats.cgpa.toFixed(2) : '—'}
              </span>
              <span className="text-lg font-bold text-muted">/ 4.00</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-muted font-medium leading-relaxed">
              Based on <span className="text-fg font-bold">{stats.totalGradedCreditsAll}</span> graded credits across{' '}
              <span className="text-fg font-bold">{stats.totalSemesters}</span> semesters
            </div>
            <Link
              href="/results"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-accent hover:underline self-end sm:self-auto shrink-0"
            >
              Manage Results <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 flex flex-col justify-between shadow-card">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Credits</span>
            <div className="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center text-accent">
              <BookCheck size={20} />
            </div>
          </div>

          <div className="my-3">
            <div className="text-4xl font-black text-fg">{stats.totalCreditHoursAll}</div>
            <p className="text-xs sm:text-sm text-muted mt-1 font-medium">Credit hours completed</p>
          </div>

          <div className="text-xs text-muted flex items-center gap-1.5 font-medium">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Includes transfer & non-graded</span>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 flex flex-col justify-between shadow-card">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Courses Taken</span>
            <div className="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center text-accent">
              <Award size={20} />
            </div>
          </div>

          <div className="my-3">
            <div className="text-4xl font-black text-fg">{totalSubjects}</div>
            <p className="text-xs sm:text-sm text-muted mt-1 font-medium">Total subjects recorded</p>
          </div>

          <div className="text-xs text-muted flex items-center gap-1.5 font-medium">
            <span className="text-accent font-bold">{semesters.length}</span>
            <span>academic semesters</span>
          </div>
        </div>
      </div>

      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Academic Forecast Tool
              </span>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-fg hover:bg-bg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <WhatIfSimulator />

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
