'use client';

import React, { useEffect, useState } from 'react';
import { TimetableGrid } from '@/components/Timetable/TimetableGrid';
import { DEFAULT_TIMETABLE, storage, STORAGE_KEYS } from '@/lib/storage';
import { ClassEntry } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/Auth/AuthProvider';
import { RotateCcw } from 'lucide-react';

export default function TimetablePage() {
  const [classes, setClasses] = useState<ClassEntry[]>(DEFAULT_TIMETABLE);
  const { user } = useAuth();

  useEffect(() => {
    const loadClasses = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('user_id', user.id);

          if (data && !error && data.length > 0) {
            interface DbClass {
              id: string;
              code: string;
              subject: string;
              class_type?: ClassEntry["classType"];
              lecturer: string;
              room: string;
              is_online?: boolean;
              day: number;
              start_time: string;
              end_time: string;
              color: string;
            }
            const mapped: ClassEntry[] = (data as unknown as DbClass[]).map((d) => ({
              id: d.id,
              code: d.code,
              subject: d.subject,
              classType: d.class_type,
              lecturer: d.lecturer,
              room: d.room,
              isOnline: d.is_online,
              day: (d.day >= 0 && d.day <= 4 ? d.day : 0) as (0 | 1 | 2 | 3 | 4),
              startTime: d.start_time,
              endTime: d.end_time,
              color: d.color,
            }));
            setClasses(mapped);
            storage.set(STORAGE_KEYS.TIMETABLE, mapped);
            return;
          }
        } catch (err) {
          console.warn('Error loading classes from Supabase:', err);
        }
      }

      const localData = storage.get<ClassEntry[]>(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE);
      setClasses(localData);
    };

    loadClasses();

    const handleUpdate = () => {
      setClasses(storage.get<ClassEntry[]>(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE));
    };
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, [user]);

  const handleSaveClass = async (updatedClass: ClassEntry) => {
    const exists = classes.some((c) => c.id === updatedClass.id);
    let next: ClassEntry[];
    if (exists) {
      next = classes.map((c) => (c.id === updatedClass.id ? updatedClass : c));
    } else {
      next = [...classes, updatedClass];
    }
    setClasses(next);
    storage.set(STORAGE_KEYS.TIMETABLE, next);

    if (user) {
      try {
        await supabase.from('classes').upsert({
          id: updatedClass.id,
          user_id: user.id,
          code: updatedClass.code,
          subject: updatedClass.subject,
          class_type: updatedClass.classType || 'Lecture',
          lecturer: updatedClass.lecturer,
          room: updatedClass.room,
          is_online: updatedClass.isOnline || false,
          day: updatedClass.day,
          start_time: updatedClass.startTime,
          end_time: updatedClass.endTime,
          color: updatedClass.color,
        });
      } catch (err) {
        console.error('Failed to sync class to Supabase:', err);
      }
    }
  };

  const handleDeleteClass = async (id: string) => {
    const next = classes.filter((c) => c.id !== id);
    setClasses(next);
    storage.set(STORAGE_KEYS.TIMETABLE, next);

    if (user) {
      try {
        await supabase.from('classes').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete class from Supabase:', err);
      }
    }
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
