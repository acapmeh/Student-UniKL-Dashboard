'use client';

import React from 'react';
import { WelcomeCard } from '@/components/DashboardHome/WelcomeCard';
import { TodaySchedule } from '@/components/DashboardHome/TodaySchedule';
import { RecentResultsPreview } from '@/components/DashboardHome/RecentResultsPreview';
import { CgpaCard } from '@/components/DashboardHome/CgpaCard';
import Link from 'next/link';
import { CalendarDays, GraduationCap, Trophy, Palette, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Welcome Banner */}
      <WelcomeCard />

      {/* 2. Today's Schedule Hero Section (Placed first right below Good Evening) */}
      <section>
        <TodaySchedule />
      </section>

      {/* 3. Academic Row: Latest Results (Left) and Cumulative CGPA (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Latest Semester Results (Directly below Today's Schedule on the left) */}
        <div className="lg:col-span-6 flex flex-col">
          <RecentResultsPreview />
        </div>

        {/* Cumulative CGPA & Academic Stats (Alongside Latest Results on the right) */}
        <div className="lg:col-span-6 flex flex-col">
          <CgpaCard layout="grid" />
        </div>
      </div>

      {/* 4. Quick Shortcuts At The Very Bottom (Full width across all columns) */}
      <section className="rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-card">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
            <span>⚡</span> Quick Shortcuts
          </h3>
          <span className="text-xs text-accent font-bold">Fast Academic Navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/timetable"
            className="group p-4 rounded-2xl bg-bg/80 hover:bg-card-hover border border-border hover:border-accent/50 transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-muted group-hover:text-accent">
              <CalendarDays size={22} />
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-fg">Full Timetable</p>
              <p className="text-xs text-muted mt-0.5">Weekly Mon–Fri (Until 9 PM)</p>
            </div>
          </Link>

          <Link
            href="/results"
            className="group p-4 rounded-2xl bg-bg/80 hover:bg-card-hover border border-border hover:border-accent/50 transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-muted group-hover:text-accent">
              <GraduationCap size={22} />
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-fg">CGPA Calculator</p>
              <p className="text-xs text-muted mt-0.5">UniKL Grading Scale</p>
            </div>
          </Link>

          <Link
            href="/achievements"
            className="group p-4 rounded-2xl bg-bg/80 hover:bg-card-hover border border-border hover:border-accent/50 transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-muted group-hover:text-accent">
              <Trophy size={22} />
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-fg">Achievements</p>
              <p className="text-xs text-muted mt-0.5">Portfolio & Activities</p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="group p-4 rounded-2xl bg-bg/80 hover:bg-card-hover border border-border hover:border-accent/50 transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-muted group-hover:text-accent">
              <Palette size={22} />
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-fg">Theme & Settings</p>
              <p className="text-xs text-muted mt-0.5">UniKL Navy & Gold</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
