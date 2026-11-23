'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, GraduationCap, PlusCircle, Award } from 'lucide-react';
import { DEFAULT_RESULTS, storage, STORAGE_KEYS } from '@/lib/storage';
import { Semester } from '@/lib/types';
import { calcGPA } from '@/lib/grading';

export function RecentResultsPreview() {
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

  const latestSemester = semesters.length > 0 ? semesters[semesters.length - 1] : null;
  const semGpa = latestSemester ? calcGPA(latestSemester.subjects) : null;

  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <GraduationCap size={22} className="text-accent" />
            <h2 className="text-lg sm:text-xl font-bold text-fg">Latest Semester Results</h2>
          </div>
          {latestSemester && (
            <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-accent/20 text-accent font-bold border border-accent/30">
              GPA: {semGpa?.gpa !== null && semGpa?.gpa !== undefined ? semGpa.gpa.toFixed(2) : 'N/A'}
            </span>
          )}
        </div>

        {latestSemester ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted mb-3 font-semibold">
              <span>{latestSemester.name}</span>
              <span>{latestSemester.subjects.length} Subjects</span>
            </div>

            <div className="space-y-2.5">
              {latestSemester.subjects.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg/70 border border-border text-sm"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-fg truncate text-sm">{sub.name}</p>
                    <p className="text-xs text-muted font-medium mt-0.5">
                      {sub.code ? `${sub.code} • ` : ''}
                      {sub.creditHours} Credits
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                        sub.grade === 'A' || sub.grade === 'A-'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35'
                          : sub.grade.startsWith('B')
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/35'
                          : sub.grade.startsWith('C')
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/35'
                          : sub.grade === 'S' || sub.grade === 'I'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/35'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/35'
                      }`}
                    >
                      {sub.grade}
                    </span>
                  </div>
                </div>
              ))}

              {latestSemester.subjects.length > 5 && (
                <p className="text-center text-xs text-muted pt-1 font-medium">
                  + {latestSemester.subjects.length - 5} more subjects in this semester
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center">
            <Award size={36} className="mx-auto text-muted mb-2 opacity-50" />
            <p className="text-sm text-muted">No semester results recorded yet.</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
        <Link
          href="/results"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-fg hover:text-accent transition-colors"
        >
          <PlusCircle size={15} className="text-accent" />
          Add / Edit Subjects
        </Link>
        <Link
          href="/results"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-accent hover:underline"
        >
          View All Semesters <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
