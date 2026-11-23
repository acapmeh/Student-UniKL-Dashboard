'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Semester, Subject } from '@/lib/types';
import { calcGPA } from '@/lib/grading';
import { SubjectRow } from './SubjectRow';

interface SemesterAccordionProps {
  semester: Semester;
  semesterIndex: number;
  onUpdateSemester: (updated: Semester) => void;
  onDeleteSemester: (id: string) => void;
}

export function SemesterAccordion({
  semester,
  semesterIndex,
  onUpdateSemester,
  onDeleteSemester,
}: SemesterAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(semester.name);

  const gpaResult = calcGPA(semester.subjects);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateSemester({ ...semester, name: titleInput.trim() });
    } else {
      setTitleInput(semester.name);
    }
  };

  const handleAddSubject = () => {
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      code: '',
      name: 'New Subject',
      creditHours: 3,
      grade: 'A',
    };
    onUpdateSemester({
      ...semester,
      subjects: [...semester.subjects, newSubject],
    });
  };

  const handleUpdateSubject = (updatedSub: Subject) => {
    const next = semester.subjects.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    onUpdateSemester({ ...semester, subjects: next });
  };

  const handleDeleteSubject = (subId: string) => {
    const next = semester.subjects.filter((s) => s.id !== subId);
    onUpdateSemester({ ...semester, subjects: next });
  };

  return (
    <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden transition-all">
      {/* Semester Header */}
      <div className="p-5 sm:p-6 bg-bg/50 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-xl text-muted hover:text-fg hover:bg-card-hover transition-colors"
          >
            {isOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </button>

          <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-black text-base shadow-sm">
            #{semesterIndex + 1}
          </div>

          <div>
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className="px-3 py-1.5 rounded-xl bg-bg border border-accent text-base font-bold text-fg outline-none"
              />
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                className="text-base sm:text-lg font-bold text-fg hover:text-accent cursor-pointer flex items-center gap-2 group transition-colors"
                title="Click to rename semester"
              >
                <span>{semester.name}</span>
                <span className="text-xs text-muted font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                  (rename)
                </span>
              </h3>
            )}
            <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
              {semester.subjects.length} subjects • {gpaResult.totalCreditHours} total credits ({gpaResult.gradedCreditHours} graded)
            </p>
          </div>
        </div>

        {/* GPA & Actions */}
        <div className="flex items-center gap-3.5 self-end sm:self-auto">
          <div className="flex items-baseline gap-2 px-4 py-2 rounded-2xl bg-bg border border-border">
            <span className="text-xs sm:text-sm font-bold text-muted">Semester GPA:</span>
            <span className="text-base sm:text-lg font-black text-accent">
              {gpaResult.gpa !== null ? gpaResult.gpa.toFixed(2) : 'N/A'}
            </span>
          </div>

          <button
            onClick={() => onDeleteSemester(semester.id)}
            className="p-2.5 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Semester"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Column labels (desktop) */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-3 text-xs font-bold uppercase tracking-wider text-muted">
            <div className="col-span-2">Course Code</div>
            <div className="col-span-4">Subject Name</div>
            <div className="col-span-2">Credit Hours</div>
            <div className="col-span-2">Grade</div>
            <div className="col-span-2 text-right">Points / Action</div>
          </div>

          {semester.subjects.length === 0 ? (
            <div className="py-10 text-center rounded-2xl bg-bg/40 border border-dashed border-border p-5">
              <p className="text-sm text-muted">No subjects in this semester yet.</p>
              <button
                onClick={handleAddSubject}
                className="mt-3 text-xs sm:text-sm font-bold text-accent hover:underline inline-flex items-center gap-1.5"
              >
                <Plus size={16} /> Add first subject
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {semester.subjects.map((sub, idx) => (
                <SubjectRow
                  key={sub.id}
                  subject={sub}
                  index={idx}
                  onUpdate={handleUpdateSubject}
                  onDelete={handleDeleteSubject}
                />
              ))}
            </div>
          )}

          {/* Add Subject Footer Button */}
          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={handleAddSubject}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-bg hover:bg-card-hover border border-border text-fg hover:text-accent transition-colors"
            >
              <Plus size={16} className="text-accent" />
              <span>Add Subject to {semester.name}</span>
            </button>

            <span className="text-xs text-muted font-medium">
              Auto calculates GPA & cumulative CGPA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
