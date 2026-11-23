'use client';

import React from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { ThemePresets } from '@/components/Settings/ThemePresets';
import { ProfileForm } from '@/components/Settings/ProfileForm';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fadeIn pb-14 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-9 rounded-3xl bg-card border border-border shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Palette size={160} className="text-accent" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* UniKL Official Logo strictly from User's 2nd reference picture */}
            <div className="flex items-center mr-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/unikl-official-logo-badge.png"
                alt="UniKL Official Logo"
                className="h-7 w-auto object-contain rounded-md shadow-xs border border-white/10"
              />
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-bold border border-accent/30 flex items-center gap-1.5">
              <Sparkles size={14} />
              Personalization & Settings
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-fg tracking-tight">
            Dashboard Themes & Student Profile
          </h1>
          <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
            Switch between 6 beautiful dark themes tailored for UniKL and student productivity. Update your profile information and manage your local data backup.
          </p>
        </div>
      </div>

      {/* Theme Presets */}
      <ThemePresets />

      {/* Profile Form & Data Backup */}
      <ProfileForm />
    </div>
  );
}
