import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsmozdodmnjgyguchyhn.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzbW96ZG9kbW5qZ3lndWNoeWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NjQ3OTAsImV4cCI6MjExMTA0MDc5MH0.HhRXrr1WgRHzuEhCuUNdBvnm3ZTnd09f31F_aEfVjSg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
