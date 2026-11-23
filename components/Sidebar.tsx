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
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#F2B66D] border-b border-[#DDA35B] z-40 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#011C3B]/10 text-[#011C3B] hover:bg-[#011C3B]/20 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* UniKL Logo Mobile with High Contrast */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white/95 px-2 py-1 rounded-xl shadow-xs border border-white/60 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/unikl-logo-transparent.png"
                alt="UniKL Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="text-xs text-[#011C3B] font-black tracking-wider uppercase">Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-[#011C3B]/30" style={{ backgroundColor: '#011C3B' }} />
          <span className="text-xs text-[#011C3B] font-black max-w-[110px] sm:max-w-none truncate">{profile.currentSemester}</span>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container — Rich UniKL Warm Gold #F2B66D */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-[#F2B66D] border-r border-[#DDA35B] z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#DDA35B] bg-[#F2B66D] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white/95 px-2.5 py-1.5 rounded-2xl shadow-xs border border-white/60 flex items-center group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/unikl-logo-transparent.png"
                alt="Universiti Kuala Lumpur Logo"
                className="h-10 w-auto object-contain drop-shadow-xs"
              />
            </div>

            <div className="pl-2 border-l border-[#011C3B]/20">
              <p className="text-xs font-black tracking-wider text-[#011C3B] uppercase leading-tight">Student</p>
              <p className="text-[11px] text-[#011C3B]/80 font-bold">Dashboard</p>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#011C3B] hover:bg-[#011C3B]/10"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#011C3B]/70">Main Menu</span>
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
                    ? 'bg-[#011C3B] text-white shadow-md translate-x-1'
                    : 'text-[#011C3B] font-extrabold hover:bg-[#011C3B]/12'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={22}
                    className={`transition-colors ${
                      isActive ? 'text-[#F2B66D]' : 'text-[#011C3B] group-hover:text-[#011C3B]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                      isActive
                        ? 'bg-[#F2B66D] text-[#011C3B]'
                        : 'bg-[#011C3B]/15 text-[#011C3B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#011C3B]/70">Official Theme</span>
          </div>

          <div
            className="p-3.5 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-xs shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border border-white shadow-xs"
                style={{ backgroundColor: '#011C3B' }}
              />
              <div className="text-left">
                <p className="text-sm font-black text-[#011C3B] leading-tight">{themePreset.name}</p>
                <p className="text-xs text-[#011C3B]/80 font-bold">UniKL Official Identity</p>
              </div>
            </div>
            <Sparkles size={16} className="text-[#011C3B]" />
          </div>
        </nav>

        {/* Footer Profile Mini Card */}
        <div className="p-4 border-t border-[#DDA35B] bg-[#F2B66D]">
          <Link
            href="/settings"
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-[#011C3B]/10 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-[#011C3B] text-[#F2B66D] font-black flex items-center justify-center text-base shadow-xs">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-[#011C3B] truncate group-hover:underline transition-all">
                {profile.name}
              </p>
              <p className="text-xs text-[#011C3B]/80 truncate font-bold">{profile.currentSemester}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
