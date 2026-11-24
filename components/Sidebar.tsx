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
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from './Auth/AuthProvider';
import { DEFAULT_PROFILE, storage, STORAGE_KEYS } from '@/lib/storage';
import { Profile } from '@/lib/types';
import { useTheme } from './ThemeProvider';

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentTheme, themePreset, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const loadProfile = () => {
      const p = storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
      setProfile(p);
    };
    loadProfile();

    const handleStorage = () => {
      setProfile(storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE));
    };

    window.addEventListener('dashboard_storage_update', handleStorage);
    return () => window.removeEventListener('dashboard_storage_update', handleStorage);
  }, []);

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
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-bg text-muted hover:text-fg transition-colors"
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
            <span className="text-xs text-muted font-bold tracking-wider uppercase">Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-accent font-bold max-w-[110px] sm:max-w-none truncate">{profile.currentSemester}</span>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header: Exact Image 1 in crisp white container (Zero Overblending) */}
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
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
            className="lg:hidden ml-2 p-1.5 rounded-lg text-muted hover:text-fg hover:bg-card-hover"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Main Menu</span>
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
                    ? 'bg-accent/15 border border-accent/40 text-accent shadow-xs translate-x-1'
                    : 'text-muted hover:text-fg hover:bg-card-hover'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={22}
                    className={`transition-colors ${
                      isActive ? 'text-accent' : 'text-muted group-hover:text-fg'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-accent text-accent-fg'
                        : 'bg-bg border border-border text-muted'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Theme Quick Toggle Section */}
          <div className="pt-6 px-3 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Theme</span>
            <span className="text-[10px] text-accent font-bold">1-Click Switch</span>
          </div>

          <button
            type="button"
            onClick={() => setTheme(currentTheme === 'unikl-navy' ? 'unikl-cream' : 'unikl-navy')}
            className="w-full p-3.5 rounded-2xl bg-bg border border-border hover:border-accent/50 transition-all flex items-center justify-between group cursor-pointer text-left shadow-2xs"
            title="Click to toggle Dark Navy / Warm Campus Cream"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border border-accent/40 shadow-xs shrink-0"
                style={{ backgroundColor: themePreset.accentPreview }}
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-fg leading-tight truncate">{themePreset.name}</p>
                <p className="text-xs text-muted font-medium truncate">
                  {currentTheme === 'unikl-navy' ? 'Switch to Light Mode' : 'Switch to Dark Navy'}
                </p>
              </div>
            </div>
            <div className="p-1.5 rounded-xl bg-card border border-border group-hover:border-accent/40 text-accent transition-colors">
              {currentTheme === 'unikl-navy' ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </div>
          </button>
        </nav>

        {/* Footer Profile Mini Card */}
        <div className="p-4 border-t border-border bg-card space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-card-hover transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-accent/20 border border-accent/40 text-accent font-black flex items-center justify-center text-base shadow-xs">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-fg truncate group-hover:text-accent transition-colors">
                {profile.name}
              </p>
              <p className="text-xs text-muted truncate font-medium">{user?.email || profile.currentSemester}</p>
            </div>
          </Link>

          {user && (
            <button
              onClick={() => signOut()}
              className="w-full py-2 px-3 rounded-xl bg-bg hover:bg-rose-500/15 text-muted hover:text-rose-400 border border-border hover:border-rose-400/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
