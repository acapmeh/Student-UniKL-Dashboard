'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/lib/types';
import { DEFAULT_PROFILE, storage, STORAGE_KEYS } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: {
    email: string;
    password: string;
    name: string;
    studentId: string;
    program?: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, userMeta?: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        const loaded: Profile = {
          name: data.name || (userMeta?.name as string) || 'Asyraf Zulkifli',
          studentId: data.student_id || (userMeta?.student_id as string) || '52213123456',
          campus: data.campus || 'Universiti Kuala Lumpur (UniKL)',
          program: data.program || (userMeta?.program as string) || 'Bachelor of Financial Technology',
          currentSemester: data.current_semester || 'Semester 4',
          targetCgpa: data.target_cgpa ? parseFloat(data.target_cgpa) : 3.85,
        };
        setProfile(loaded);
        storage.set(STORAGE_KEYS.PROFILE, loaded);
      } else if (userMeta) {
        const fallback: Profile = {
          name: (userMeta.name as string) || 'Asyraf Zulkifli',
          studentId: (userMeta.student_id as string) || '52213123456',
          campus: 'Universiti Kuala Lumpur (UniKL)',
          program: (userMeta.program as string) || 'Bachelor of Financial Technology',
          currentSemester: 'Semester 4',
          targetCgpa: 3.85,
        };
        setProfile(fallback);
        storage.set(STORAGE_KEYS.PROFILE, fallback);
      }
    } catch (err) {
      console.warn('Error fetching profile from Supabase:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.user_metadata);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.user_metadata);
        } else {
          setProfile(DEFAULT_PROFILE);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await fetchProfile(data.user.id, data.user.user_metadata);
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      return { error: msg };
    }
  };

  const signUp = async ({
    email,
    password,
    name,
    studentId,
    program = 'Bachelor of Financial Technology',
  }: {
    email: string;
    password: string;
    name: string;
    studentId: string;
    program?: string;
  }) => {
    try {
      const { error: rpcErr } = await supabase.rpc('register_student', {
        p_email: email.trim(),
        p_password: password,
        p_name: name.trim(),
        p_student_id: studentId.trim(),
        p_program: program.trim(),
      });

      if (rpcErr) {
        return { error: rpcErr.message };
      }

      return await signIn(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      return { error: msg };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(DEFAULT_PROFILE);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.user_metadata);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
