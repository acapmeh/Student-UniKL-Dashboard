'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  BookOpen,
  Video,
  UserCheck,
  Mail,
  Phone,
  MessageCircle,
  Settings,
  Sparkles,
} from 'lucide-react';
import { storage, STORAGE_KEYS, DEFAULT_PROFILE } from '@/lib/storage';
import { Profile } from '@/lib/types';

export function QuickLaunchDock() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    const loadProfile = () => {
      const p = storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
      setProfile(p);
    };

    loadProfile();
    const handleUpdate = () => loadProfile();
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, []);

  const advisor = profile.advisor || {
    name: 'Assoc. Prof. Dr. Azman Bin Ahmad',
    email: 'azman.ahmad@unikl.edu.my',
    phone: '+60 12-345 6789',
  };

  // Clean phone number for WhatsApp wa.me link
  const cleanPhone = advisor.phone.replace(/[^0-9]/g, '');

  return (
    <div className="rounded-3xl bg-card border border-border p-5 sm:p-6 shadow-card transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-border gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-accent/15 text-accent">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-fg tracking-wide uppercase">
              1-Click Academic Launch Dock
            </h3>
            <p className="text-xs text-muted">Direct fast access to official UniKL portals & advisor</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-accent/90 bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20 w-fit">
          Single Sign-On Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. UniKL VLE Card */}
        <a
          href="https://vle.unikl.edu.my/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between p-4 rounded-2xl bg-bg/70 hover:bg-card-hover border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 dark:bg-[#0047AB]/30 dark:text-[#60a5fa] flex items-center justify-center font-bold">
                <BookOpen size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-[#0047AB]/15 dark:text-[#93c5fd]">
                UniKL VLE
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-sm font-bold text-fg group-hover:text-accent transition-colors flex items-center gap-1.5">
                UniKL Virtual Learning
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
              </h4>
              <p className="text-xs text-muted mt-1 line-clamp-2">
                Access lecture slides, upload assignments, and complete weekly formative quizzes.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-accent">
            <span>Open Moodle Portal</span>
            <span className="text-xs">→</span>
          </div>
        </a>

        {/* 2. Microsoft Teams Card (Launches Installed App Directly via msteams://) */}
        <div className="group relative flex flex-col justify-between p-4 rounded-2xl bg-bg/70 hover:bg-card-hover border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 min-w-0">
          <a
            href="msteams://teams.microsoft.com/"
            className="block flex-1 focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-[#5059C9]/30 dark:text-[#a5b4fc] flex items-center justify-center font-bold">
                <Video size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-[#5059C9]/15 dark:text-[#c7d2fe]">
                MS Teams App
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-sm font-bold text-fg group-hover:text-accent transition-colors flex items-center gap-1.5">
                Microsoft Teams
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
              </h4>
              <p className="text-xs text-muted mt-1 line-clamp-2">
                Join live lectures, participate in subject channel discussions, and collaborate on group work.
              </p>
            </div>
          </a>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
            <a
              href="msteams://teams.microsoft.com/"
              className="font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>Launch Teams App</span>
              <span>→</span>
            </a>
            <a
              href="https://teams.microsoft.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-muted hover:text-fg transition-colors whitespace-nowrap"
              title="Open Teams in browser if desktop app is not installed"
            >
              Web fallback ↗
            </a>
          </div>
        </div>

        {/* 3. Academic Advisor (Penasihat Akademik / PA) Card */}
        <div className="relative flex flex-col justify-between p-4 rounded-2xl bg-bg/70 border border-border shadow-xs hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
                <UserCheck size={20} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  Academic Advisor
                </span>
                <Link
                  href="/settings#advisor"
                  className="p-1 text-muted hover:text-accent transition-colors rounded-lg hover:bg-card-hover"
                  title="Configure Advisor Info in Settings"
                >
                  <Settings size={14} />
                </Link>
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-sm font-bold text-fg truncate">
                {advisor.name}
              </h4>
              <p className="text-xs text-muted mt-0.5">Penasihat Akademik (PA)</p>
            </div>

            <div className="mt-2.5 space-y-1 text-xs text-muted">
              <div className="flex items-center gap-1.5 truncate">
                <Mail size={12} className="text-accent shrink-0" />
                <span className="truncate">{advisor.email}</span>
              </div>
              {advisor.phone && (
                <div className="flex items-center gap-1.5 truncate">
                  <Phone size={12} className="text-accent shrink-0" />
                  <span className="truncate">{advisor.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-2">
            <a
              href={`mailto:${advisor.email}`}
              className="px-2.5 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-border text-fg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title={`Email ${advisor.email}`}
            >
              <Mail size={13} className="text-accent" />
              <span>Email</span>
            </a>
            <a
              href={cleanPhone ? `https://wa.me/${cleanPhone}` : `tel:${advisor.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-border text-fg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Call / WhatsApp Advisor"
            >
              <MessageCircle size={13} className="text-accent" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
