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
  LogOut,
} from 'lucide-react';
import { useAuth } from './Auth/AuthProvider';
import { DEFAULT_PROFILE, storage, STORAGE_KEYS } from '@/lib/storage';
import { Profile } from '@/lib/types';
import { useTheme } from './ThemeProvider';

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { themePreset } = useTheme();
  const { user, signOut } = useAuth();

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
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A162D] border-b border-[#1B325C] z-40 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#14284B] text-slate-200 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Exact Image 1 Logo on Mobile */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white px-2 py-1 rounded-xl shadow-xs border-2 border-[#F0A71B] shadow-[0_0_10px_rgba(240,167,27,0.25)] flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/unikl-sidebar-logo.jpg"
                alt="UniKL Logo"
                className="h-7 w-auto object-contain"
              />
            </div>
            <span className="text-xs text-slate-300 font-bold tracking-wider uppercase">Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#F0A71B] font-bold max-w-[110px] sm:max-w-none truncate">{profile.currentSemester}</span>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container — Modern Dark Navy #0A162D */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-[#0A162D] border-r border-[#1B325C] z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header: Exact Image 1 in crisp white container (Zero Overblending) */}
        <div className="p-4 border-b border-[#1B325C] bg-[#0A162D] flex items-center justify-between">
          <Link href="/" className="w-full flex items-center justify-center">
            <div className="w-full bg-white px-3 py-2 rounded-2xl shadow-sm border-2 border-[#F0A71B] shadow-[0_0_14px_rgba(240,167,27,0.25)] flex items-center justify-center hover:scale-[1.02] transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/unikl-sidebar-logo.jpg"
                alt="Universiti Kuala Lumpur Logo"
                className="h-10 sm:h-11 w-auto max-h-12 object-contain"
              />
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
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
                    ? 'bg-[#14284B] border border-[#23457D] text-[#F0A71B] shadow-sm translate-x-1'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={22}
                    className={`transition-colors ${
                      isActive ? 'text-[#F0A71B]' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#F0A71B] text-[#081226]'
                        : 'bg-[#0E1D38] border border-[#1B325C] text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Theme</span>
          </div>

          <div
            className="p-3.5 rounded-2xl bg-[#0E1D38] border border-[#1B325C] shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border border-amber-300 shadow-xs"
                style={{ backgroundColor: '#F0A71B' }}
              />
              <div className="text-left">
                <p className="text-sm font-bold text-white leading-tight">{themePreset.name}</p>
                <p className="text-xs text-slate-400 font-medium">UniKL Official Identity</p>
              </div>
            </div>
            <Sparkles size={16} className="text-[#F0A71B]" />
          </div>
        </nav>

        {/* Footer Profile Mini Card */}
        <div className="p-4 border-t border-[#1B325C] bg-[#0A162D] space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-[#14284B] border border-[#23457D] text-[#F0A71B] font-black flex items-center justify-center text-base shadow-xs">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate group-hover:text-[#F0A71B] transition-colors">
                {profile.name}
              </p>
              <p className="text-xs text-slate-400 truncate font-medium">{user?.email || profile.currentSemester}</p>
            </div>
          </Link>

          {user && (
            <button
              onClick={() => signOut()}
              className="w-full py-2 px-3 rounded-xl bg-[#0E1D38] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-[#1B325C] hover:border-rose-800/60 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
