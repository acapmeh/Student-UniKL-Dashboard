'use client';

import React, { useEffect, useState } from 'react';
import { Award, GraduationCap } from 'lucide-react';
import { Profile } from '@/lib/types';
import { DEFAULT_PROFILE, storage, STORAGE_KEYS } from '@/lib/storage';

export function WelcomeCard() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [greeting, setGreeting] = useState<string>('Hello');

  useEffect(() => {
    const p = storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    setProfile(p);

    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const handleUpdate = () => {
      setProfile(storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE));
    };
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 sm:p-8 lg:p-10 shadow-card">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3">
            {/* Exact Image 2 (UniKL Badge) strictly from user */}
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-white/50 flex items-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/unikl-badge-logo.png"
                alt="UniKL Badge"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent border border-accent/30 shrink-0">
              {profile.currentSemester}
            </span>

            <span className="text-xs text-slate-200 font-bold flex items-center gap-1.5 bg-bg/90 px-3 py-1 rounded-full border border-border shrink-0 shadow-2xs">
              <GraduationCap size={14} className="text-accent" />
              <span>{profile.program || 'Bachelor of Information Technology'}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-fg tracking-tight leading-snug break-words">
            {greeting},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-accent">
              {profile.name}!
            </span>{' '}
            👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-muted max-w-2xl leading-relaxed">
            Welcome back to your academic space. Track your semester timetable, monitor your CGPA, and document your university milestones.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center p-4 sm:p-5 rounded-2xl bg-bg/90 border border-border shadow-sm shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
              <Award size={16} className="text-accent" />
              <span>Target CGPA</span>
            </div>
            <span className="text-xs text-muted font-semibold block md:hidden mt-0.5">Academic Goal</span>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-accent tracking-tight block">
              {profile.targetCgpa ? profile.targetCgpa.toFixed(2) : '4.00'}
            </span>
            <span className="text-xs text-muted font-semibold hidden md:block">Academic Goal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
