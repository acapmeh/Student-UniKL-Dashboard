'use client';

import React from 'react';
import { WelcomeCard } from '@/components/DashboardHome/WelcomeCard';
import { CgpaCard } from '@/components/DashboardHome/CgpaCard';
import { TodaySchedule } from '@/components/DashboardHome/TodaySchedule';
import { RecentResultsPreview } from '@/components/DashboardHome/RecentResultsPreview';
import Link from 'next/link';
import { CalendarDays, GraduationCap, Trophy, Palette, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* CGPA & Academic Stats Strip */}
      <CgpaCard />

      {/* Main Grid: Timetable & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Today's Timetable (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          <TodaySchedule />
        </div>

        {/* Results & Quick Nav (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-6">
          <RecentResultsPreview />

          {/* Quick Access Action Cards */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/timetable"
                className="group p-3 rounded-xl bg-bg/80 hover:bg-card-hover border border-border hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-muted group-hover:text-accent">
                  <CalendarDays size={18} />
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-fg">Full Timetable</p>
                  <p className="text-[10px] text-muted">Weekly Mon–Fri</p>
                </div>
              </Link>

              <Link
                href="/results"
                className="group p-3 rounded-xl bg-bg/80 hover:bg-card-hover border border-border hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-muted group-hover:text-accent">
                  <GraduationCap size={18} />
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-fg">CGPA Calculator</p>
                  <p className="text-[10px] text-muted">UniKL Grading</p>
                </div>
              </Link>

              <Link
                href="/achievements"
                className="group p-3 rounded-xl bg-bg/80 hover:bg-card-hover border border-border hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-muted group-hover:text-accent">
                  <Trophy size={18} />
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-fg">Achievements</p>
                  <p className="text-[10px] text-muted">Photos & Activities</p>
                </div>
              </Link>

              <Link
                href="/settings"
                className="group p-3 rounded-xl bg-bg/80 hover:bg-card-hover border border-border hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-muted group-hover:text-accent">
                  <Palette size={18} />
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-fg">Change Theme</p>
                  <p className="text-[10px] text-muted">6 UniKL Presets</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
