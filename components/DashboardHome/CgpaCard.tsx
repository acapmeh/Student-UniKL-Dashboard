'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, BookCheck, Calculator, ChevronRight, TrendingUp } from 'lucide-react';
import { calcCGPA, getAcademicStanding } from '@/lib/grading';
import { DEFAULT_RESULTS, storage, STORAGE_KEYS } from '@/lib/storage';
import { Semester } from '@/lib/types';

interface CgpaCardProps {
  layout?: 'strip' | 'grid';
}

export function CgpaCard({ layout = 'grid' }: CgpaCardProps) {
  const [semesters, setSemesters] = useState<Semester[]>(DEFAULT_RESULTS);

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
      <div className="flex flex-col gap-5 h-full justify-between">
        {/* Primary CGPA Display Card */}
        <div className="flex-1 rounded-3xl bg-gradient-to-br from-card via-card to-card-hover border border-border p-6 sm:p-7 flex flex-col justify-between shadow-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award size={120} className="text-accent" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Calculator size={16} className="text-accent" />
                Cumulative CGPA
              </span>
              <span className={`text-xs px-3 py-1 rounded-full bg-bg border border-border font-bold ${standing.colorClass}`}>
                {standing.text}
              </span>
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
    );
  }

  // Strip layout fallback
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="sm:col-span-2 rounded-3xl bg-gradient-to-br from-card via-card to-card-hover border border-border p-6 sm:p-7 flex flex-col justify-between shadow-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Award size={120} className="text-accent" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Calculator size={16} className="text-accent" />
              Cumulative CGPA
            </span>
            <span className={`text-xs px-3 py-1 rounded-full bg-bg border border-border font-bold ${standing.colorClass}`}>
              {standing.text}
            </span>
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
  );
}
