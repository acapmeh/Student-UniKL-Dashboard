'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Grade, Subject } from '@/lib/types';
import { GRADE_SCALE } from '@/lib/grading';

interface SubjectRowProps {
  subject: Subject;
  index?: number;
  onUpdate: (updated: Subject) => void;
  onDelete: (id: string) => void;
}

const ALL_GRADES: Grade[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'S', 'I'];

export function SubjectRow({ subject, onUpdate, onDelete }: SubjectRowProps) {
  const scaleInfo = GRADE_SCALE[subject.grade];

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-bg/70 border border-border hover:border-accent/30 transition-all text-sm space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-3.5 sm:items-center">
      {/* Mobile Row 1 / Desktop Left Half: Code & Subject Name */}
      <div className="grid grid-cols-12 gap-2 sm:col-span-6">
        <div className="col-span-4 sm:col-span-4">
          <input
            type="text"
            placeholder="Code"
            value={subject.code || ''}
            onChange={(e) => onUpdate({ ...subject, code: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 rounded-xl bg-card border border-border focus:border-accent text-fg font-mono uppercase font-bold text-xs sm:text-sm outline-none"
          />
        </div>
        <div className="col-span-8 sm:col-span-8">
          <input
            type="text"
            placeholder="Subject Name"
            value={subject.name}
            onChange={(e) => onUpdate({ ...subject, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-card border border-border focus:border-accent text-fg font-semibold text-xs sm:text-sm outline-none"
          />
        </div>
      </div>

      {/* Mobile Row 2 / Desktop Right Half: Credits, Grade, Points & Delete */}
      <div className="grid grid-cols-12 gap-2 items-center sm:col-span-6">
        {/* Credit Hours */}
        <div className="col-span-4 sm:col-span-4">
          <select
            value={subject.creditHours}
            onChange={(e) => onUpdate({ ...subject, creditHours: Number(e.target.value) })}
            className="w-full px-2.5 sm:px-3 py-2 rounded-xl bg-card border border-border focus:border-accent text-fg text-xs sm:text-sm font-bold outline-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map((c) => (
              <option key={c} value={c}>
                {c} {c === 1 ? 'Credit' : 'Credits'}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Selector */}
        <div className="col-span-4 sm:col-span-4">
          <select
            value={subject.grade}
            onChange={(e) => onUpdate({ ...subject, grade: e.target.value as Grade })}
            className={`w-full px-2 sm:px-3 py-2 rounded-xl border font-black text-xs sm:text-sm outline-none cursor-pointer ${
              subject.grade === 'A' || subject.grade === 'A-'
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/35 dark:text-emerald-400'
                : subject.grade.startsWith('B')
                ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-500/15 dark:border-blue-500/35 dark:text-blue-400'
                : subject.grade.startsWith('C')
                ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/15 dark:border-amber-500/35 dark:text-amber-400'
                : subject.grade === 'S' || subject.grade === 'I'
                ? 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-500/15 dark:border-purple-500/35 dark:text-purple-400'
                : 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-500/15 dark:border-rose-500/35 dark:text-rose-400'
            }`}
          >
            {ALL_GRADES.map((g) => (
              <option key={g} value={g} className="bg-card text-fg">
                {GRADE_SCALE[g].label}
              </option>
            ))}
          </select>
        </div>

        {/* Points & Delete */}
        <div className="col-span-4 sm:col-span-4 flex items-center justify-between pl-1 sm:pl-2">
          <span className="text-xs sm:text-sm font-mono font-bold text-muted truncate">
            {scaleInfo?.point !== null ? `${scaleInfo.point.toFixed(2)} pts` : 'No GPA'}
          </span>

          <button
            onClick={() => onDelete(subject.id)}
            className="p-1.5 sm:p-2 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            title="Remove Subject"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
