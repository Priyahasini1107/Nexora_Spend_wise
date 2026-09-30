import { createClient } from '@supabase/supabase-js';

// Default project URL provided in prompt
const DEFAULT_SUPABASE_URL = 'https://wndadtpiukiapijginbh.supabase.co';

// Get keys from Vite environment variables or localStorage
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('kuberpulse_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('kuberpulse_supabase_key') : null;

  const url = storedUrl || envUrl || DEFAULT_SUPABASE_URL;
  const key = storedKey || envKey || '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key && key.trim().length > 15 && !key.includes('[PASTE'))
  };
};

const config = getSupabaseConfig();

// Initialize Supabase client if configured, otherwise create a mock/safe client
export const supabase = config.isConfigured
  ? createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Helper to save credentials at runtime
export const saveSupabaseCredentials = (url, key) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('kuberpulse_supabase_url', url);
    if (key) localStorage.setItem('kuberpulse_supabase_key', key);
    window.location.reload();
  }
};

// Helper to clear credentials and return to demo sandbox
export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kuberpulse_supabase_url');
    localStorage.removeItem('kuberpulse_supabase_key');
    window.location.reload();
  }
};
