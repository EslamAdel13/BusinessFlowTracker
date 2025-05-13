import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if they might be switched (if URL is a JWT and anon key looks like a URL)
if (supabaseUrl.startsWith('eyJ') && (supabaseAnonKey.startsWith('http') || supabaseAnonKey.includes('supabase.co'))) {
  // They appear to be switched, so swap them
  const temp = supabaseUrl;
  supabaseUrl = supabaseAnonKey;
  supabaseAnonKey = temp;
  console.log('Detected swapped Supabase credentials, correcting...');
}

// Check if URL is not in correct format but anon key is
if (!supabaseUrl.startsWith('http') && supabaseAnonKey.startsWith('eyJ')) {
  // This is likely a configuration issue
  console.error('Supabase URL is not in correct format. It should be a URL like https://<project-id>.supabase.co');
  // Set a fallback for development only
  supabaseUrl = 'https://gkuojavspzdiszewjvho.supabase.co';
  console.log('Using fallback Supabase URL for development:', supabaseUrl);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Debug info for troubleshooting
console.log('Supabase URL format check:', {
  isUrl: supabaseUrl.startsWith('http'),
  containsSupabaseDomain: supabaseUrl.includes('supabase.co'),
  length: supabaseUrl.length
});

console.log('Supabase Anon Key format check:', {
  isJwt: supabaseAnonKey.startsWith('eyJ'),
  length: supabaseAnonKey.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseUser = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user || null;
}

export async function getUserSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
