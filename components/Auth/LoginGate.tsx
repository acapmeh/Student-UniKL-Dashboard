'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Lock, Mail, User, GraduationCap, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState('Bachelor of Financial Technology');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If loading, show elegant UniKL splash
  if (loading) {
    return (
      <div className="min-h-screen bg-[#081226] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-4 rounded-3xl border-2 border-[#F0A71B] shadow-[0_0_25px_rgba(240,167,27,0.3)] mb-6 animate-pulse">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/unikl-sidebar-logo.jpg"
            alt="Universiti Kuala Lumpur"
            className="h-14 w-auto object-contain"
          />
        </div>
        <div className="w-8 h-8 border-3 border-[#F0A71B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300">Connecting to UniKL Student Portal...</p>
      </div>
    );
  }

  // If authenticated, render children (the full dashboard)
  if (user) {
    return <>{children}</>;
  }

  // Handle Sign In submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await signIn(email, password);
    if (res.error) {
      setErrorMessage(res.error);
    }
    setIsSubmitting(false);
  };

  // Handle Register submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      setIsSubmitting(false);
      return;
    }

    const res = await signUp({
      email,
      password,
      name,
      studentId: studentId.trim() || '52213123456',
      program,
    });

    if (res.error) {
      setErrorMessage(res.error);
    }
    setIsSubmitting(false);
  };

  // Quick Demo Login Handler
  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    setEmail('asyraf.test@siswa.unikl.edu.my');
    setPassword('Password123!');
    const res = await signIn('asyraf.test@siswa.unikl.edu.my', 'Password123!');
    if (res.error) {
      setErrorMessage(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#081226] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F0A71B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-2xl border-2 border-[#F0A71B] shadow-[0_0_14px_rgba(240,167,27,0.25)] flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/unikl-sidebar-logo.jpg"
              alt="UniKL Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#F0A71B]">Official Portal</span>
            <p className="text-xs sm:text-sm font-bold text-white">Student Academic Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1D38] border border-[#1B325C] text-xs text-slate-300">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="hidden sm:inline">Supabase Cloud Secured</span>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto">
        <div className="rounded-3xl bg-[#0E1D38] border border-[#1B325C] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Badge & Welcome Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F0A71B]/20 text-[#F0A71B] border border-[#F0A71B]/30 mb-2">
              <Sparkles size={12} /> Student Access Required
            </span>
            <h1 className="text-2xl font-black text-white">
              {tab === 'signin' ? 'Welcome Back!' : 'Create Student Account'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {tab === 'signin'
                ? 'Sign in with your email and password to access your timetable, results, and achievements.'
                : 'Register your student profile to synchronize your academic records.'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#081226] border border-[#1B325C] mb-6">
            <button
              type="button"
              onClick={() => { setTab('signin'); setErrorMessage(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-[#F0A71B] text-[#081226] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMessage(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-[#F0A71B] text-[#081226] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Student Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@siswa.unikl.edu.my"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#081226] border border-[#1B325C] text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0A71B] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#081226] border border-[#1B325C] text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0A71B] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#F0A71B] hover:bg-[#d89415] text-[#081226] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#F0A71B]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In to Dashboard'}
                <ArrowRight size={16} />
              </button>

              {/* 1-Click Demo Login Helper */}
              <div className="pt-3 border-t border-[#1B325C]/80 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                  className="text-xs font-bold text-[#F0A71B] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  ⚡ Quick Demo Login (Asyraf Zulkifli)
                </button>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Asyraf Zulkifli"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#081226] border border-[#1B325C] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0A71B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="52213123456"
                    className="w-full px-3 py-2 rounded-xl bg-[#081226] border border-[#1B325C] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0A71B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Program</label>
                  <div className="relative">
                    <GraduationCap size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 rounded-xl bg-[#081226] border border-[#1B325C] text-xs text-white font-medium focus:outline-hidden focus:border-[#F0A71B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Student Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@siswa.unikl.edu.my"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#081226] border border-[#1B325C] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0A71B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Create Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#081226] border border-[#1B325C] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0A71B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-[#F0A71B] hover:bg-[#d89415] text-[#081226] font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#F0A71B]/20 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isSubmitting ? 'Registering...' : 'Register & Enter Portal'}
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-[11px] text-slate-400 pt-6">
        Universiti Kuala Lumpur (UniKL) • Student Academic Dashboard & Timetable Hub
      </footer>
    </div>
  );
}
