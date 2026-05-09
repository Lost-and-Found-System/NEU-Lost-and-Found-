import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Real-time features will not work until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    // Determine redirect URL
    // In Vite/AI Studio, we use VITE_APP_URL if defined, otherwise window.location.origin
    const redirectUrl = process.env.VITE_APP_URL || window.location.origin;
    
    console.log('Initiating Google Sign-in with redirect:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    return { data: null, error };
  }
};

export const logout = async () => {
  return await supabase.auth.signOut();
};
