'use client';

import React, { useEffect, useState } from 'react';
import { User, Save, Check, Download, Upload, ShieldCheck } from 'lucide-react';
import { DEFAULT_PROFILE, storage, STORAGE_KEYS } from '@/lib/storage';
import { Profile } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/Auth/AuthProvider';

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const p = storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    setProfile(p);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    storage.set(STORAGE_KEYS.PROFILE, profile);
    setSavedSuccess(true);

    if (user) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: profile.name,
          student_id: profile.studentId,
          campus: profile.campus,
          program: profile.program,
          current_semester: profile.currentSemester,
          target_cgpa: profile.targetCgpa,
        });
      } catch (err) {
        console.error('Failed to sync profile to Supabase:', err);
      }
    }

    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const backup = {
      profile: storage.get(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE),
      timetable: storage.get(STORAGE_KEYS.TIMETABLE, []),
      results: storage.get(STORAGE_KEYS.RESULTS, []),
      achievements: storage.get(STORAGE_KEYS.ACHIEVEMENTS, []),
      tasks: storage.get(STORAGE_KEYS.TASKS, []),
      exams: storage.get(STORAGE_KEYS.EXAMS, []),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unikl-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.profile) storage.set(STORAGE_KEYS.PROFILE, json.profile);
        if (json.timetable) storage.set(STORAGE_KEYS.TIMETABLE, json.timetable);
        if (json.results) storage.set(STORAGE_KEYS.RESULTS, json.results);
        if (json.achievements) storage.set(STORAGE_KEYS.ACHIEVEMENTS, json.achievements);
        if (json.tasks) storage.set(STORAGE_KEYS.TASKS, json.tasks);
        if (json.exams) storage.set(STORAGE_KEYS.EXAMS, json.exams);
        alert('Data imported successfully! Your dashboard has been updated.');
        window.location.reload();
      } catch {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Profile Form Card */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold shadow-sm">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-fg">Student Profile Details</h2>
              <p className="text-xs sm:text-sm text-muted">
                Your personal details shown on the welcome banner and academic cards
              </p>
            </div>
          </div>
          {savedSuccess && (
            <span className="text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-fadeIn">
              <Check size={15} /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Student ID
              </label>
              <input
                type="text"
                placeholder="e.g. 52213123456"
                value={profile.studentId}
                onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-bold outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Campus / Institute
              </label>
              <input
                type="text"
                placeholder="e.g. Universiti Kuala Lumpur (UniKL MIIT)"
                value={profile.campus}
                onChange={(e) => setProfile({ ...profile, campus: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Program of Study
              </label>
              <input
                type="text"
                placeholder="e.g. Bachelor of Information Technology"
                value={profile.program}
                onChange={(e) => setProfile({ ...profile, program: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Current Semester
              </label>
              <input
                type="text"
                placeholder="e.g. Semester 4"
                value={profile.currentSemester}
                onChange={(e) => setProfile({ ...profile, currentSemester: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Target CGPA Goal
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.00"
                placeholder="3.85"
                value={profile.targetCgpa || ''}
                onChange={(e) =>
                  setProfile({ ...profile, targetCgpa: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-bold outline-none transition-colors"
              />
            </div>
          </div>

          {/* Academic Advisor (Penasihat Akademik / PA) Section */}
          <div id="advisor" className="pt-4 border-t border-border/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                  <span>🎓</span> Academic Advisor (Penasihat Akademik / PA)
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Your assigned faculty lecturer details for the 1-click Quick Launch Dock
                </p>
              </div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                1-Click Connect
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Advisor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assoc. Prof. Dr. Azman"
                  value={profile.advisor?.name || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      advisor: {
                        name: e.target.value,
                        email: profile.advisor?.email || '',
                        phone: profile.advisor?.phone || '',
                      },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Advisor Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. azman@unikl.edu.my"
                  value={profile.advisor?.email || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      advisor: {
                        name: profile.advisor?.name || '',
                        email: e.target.value,
                        phone: profile.advisor?.phone || '',
                      },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +60 12-345 6789"
                  value={profile.advisor?.phone || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      advisor: {
                        name: profile.advisor?.name || '',
                        email: profile.advisor?.email || '',
                        phone: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-bold outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all"
            >
              <Save size={16} />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Restore Card */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center gap-3 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-fg">Data Backup & Privacy</h2>
            <p className="text-xs sm:text-sm text-muted">
              All your timetable, grades, and achievements are stored privately inside your browser
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-bg/60 border border-border">
          <div>
            <h4 className="text-sm font-bold text-fg">Backup or Transfer Your Data</h4>
            <p className="text-xs text-muted mt-0.5">
              Download a JSON file to transfer your dashboard to another laptop or phone
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-bg hover:bg-card-hover border border-border text-fg hover:text-accent transition-colors"
            >
              <Download size={15} className="text-accent" />
              <span>Export JSON</span>
            </button>

            <label className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-bg hover:bg-card-hover border border-border text-fg hover:text-accent transition-colors cursor-pointer">
              <Upload size={15} className="text-accent" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
