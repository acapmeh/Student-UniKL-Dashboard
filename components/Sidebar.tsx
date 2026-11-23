'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Trophy,
  Palette,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { DEFAULT_PROFILE, storage, STORAGE_KEYS } from '@/lib/storage';
import { Profile } from '@/lib/types';
import { useTheme } from './ThemeProvider';

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { themePreset } = useTheme();

  useEffect(() => {
    const loadProfile = () => {
      const p = storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
      setProfile(p);
    };
    loadProfile();

    window.addEventListener('dashboard_storage_update', loadProfile);
    return () => window.removeEventListener('dashboard_storage_update', handleStorage);
  }, []);

  const handleStorage = () => {
    setProfile(storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE));
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'My Timetable',
      href: '/timetable',
      icon: CalendarDays,
      badge: 'Weekly',
    },
    {
      name: 'Results & CGPA',
      href: '/results',
      icon: GraduationCap,
      badge: 'Auto Calc',
    },
    {
      name: 'Achievements',
      href: '/achievements',
      icon: Trophy,
      badge: null,
    },
    {
      name: 'Theme & Settings',
      href: '/settings',
      icon: Palette,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:text-slate-950 hover:bg-slate-200 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* UniKL Logo Mobile with High Contrast */}
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/unikl-logo-transparent.png"
              alt="UniKL Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-xs text-slate-500 font-extrabold tracking-wider uppercase">Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: themePreset.accentPreview }} />
          <span className="text-xs text-slate-700 font-bold max-w-[110px] sm:max-w-none truncate">{profile.currentSemester}</span>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container — Clean Light Background to Ensure UniKL Logo & Text Pop With Full Contrast */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-[#F8FAFC] border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Crisp White Background so 'UNIVERSITI KUALA LUMPUR' is 100% Legible */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/unikl-logo-transparent.png"
              alt="Universiti Kuala Lumpur Logo"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
            />

            <div className="pl-2 border-l border-slate-200">
              <p className="text-xs font-black tracking-wider text-slate-900 uppercase leading-tight">Student</p>
              <p className="text-[11px] text-slate-500 font-semibold">Dashboard</p>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Main Menu</span>
          </div>

          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0E1F3D] text-[#FACC15] shadow-md translate-x-1'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={22}
                    className={`transition-colors ${
                      isActive ? 'text-[#FACC15]' : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/15 text-[#FACC15]'
                        : 'bg-slate-200 text-slate-700 group-hover:text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Theme Selection</span>
          </div>

          <Link
            href="/settings"
            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border border-slate-300 shadow-xs"
                style={{ backgroundColor: themePreset.accentPreview }}
              />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">{themePreset.name}</p>
                <p className="text-xs text-slate-500 font-medium">Click to switch</p>
              </div>
            </div>
            <Sparkles size={16} className="text-amber-500" />
          </Link>
        </nav>

        {/* Footer Profile Mini Card */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <Link
            href="/settings"
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-100 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-[#0E1F3D] text-[#FACC15] font-black flex items-center justify-center text-base shadow-xs">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-[#0E1F3D] transition-colors">
                {profile.name}
              </p>
              <p className="text-xs text-slate-500 truncate font-semibold">{profile.currentSemester}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
