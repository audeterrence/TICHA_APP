import { createClient } from '@supabase/supabase-js';

// Vite requires environment variables to be prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check your .env file in the ticha_front folder.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');