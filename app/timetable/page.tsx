'use client';

import React, { useEffect, useState } from 'react';
import { TimetableGrid } from '@/components/Timetable/TimetableGrid';
import { DEFAULT_TIMETABLE, storage, STORAGE_KEYS } from '@/lib/storage';
import { ClassEntry } from '@/lib/types';
import { RotateCcw } from 'lucide-react';

export default function TimetablePage() {
  const [classes, setClasses] = useState<ClassEntry[]>(DEFAULT_TIMETABLE);

  useEffect(() => {
    const data = storage.get<ClassEntry[]>(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE);
    setClasses(data);

    const handleUpdate = () => {
      setClasses(storage.get<ClassEntry[]>(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE));
    };
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, []);

  const handleSaveClass = (updatedClass: ClassEntry) => {
    const exists = classes.some((c) => c.id === updatedClass.id);
    let next: ClassEntry[];
    if (exists) {
      next = classes.map((c) => (c.id === updatedClass.id ? updatedClass : c));
    } else {
      next = [...classes, updatedClass];
    }
    setClasses(next);
    storage.set(STORAGE_KEYS.TIMETABLE, next);
  };

  const handleDeleteClass = (id: string) => {
    const next = classes.filter((c) => c.id !== id);
    setClasses(next);
    storage.set(STORAGE_KEYS.TIMETABLE, next);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset timetable back to UniKL sample schedule?')) {
      setClasses(DEFAULT_TIMETABLE);
      storage.set(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <TimetableGrid
        classes={classes}
        onSaveClass={handleSaveClass}
        onDeleteClass={handleDeleteClass}
      />

      <div className="flex justify-end">
        <button
          onClick={handleResetToDefault}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted hover:text-fg font-semibold transition-colors"
        >
          <RotateCcw size={14} />
          <span>Reset Sample Timetable</span>
        </button>
      </div>
    </div>
  );
}
