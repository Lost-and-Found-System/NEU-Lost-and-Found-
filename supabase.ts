/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Secrets in the Settings menu.');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// For backward compatibility, but we should migrate to getSupabase()
// We use a proxy to catch access to the old 'supabase' export
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    return (getSupabase() as any)[prop];
  }
});

export const signInWithGoogle = async () => {
  const client = getSupabase();
  
  // In the AI Studio iframe environment, we must use a popup
  // because Google OAuth does not allow being rendered inside an iframe.
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}?oauth=true`,
      queryParams: {
        // hd: 'neu.edu.ph' // Commented out so you can test non-NEU emails
      },
      skipBrowserRedirect: true // Don't redirect the current window, give us the URL instead
    },
  });

  if (error) throw error;

  if (data?.url) {
    // Open the OAuth provider's URL directly in a popup
    const authWindow = window.open(
      data.url,
      'google_oauth_popup',
      'width=600,height=700'
    );

    if (!authWindow) {
      throw new Error('Popup blocked. Please allow popups for this site to sign in with Google.');
    }

    // The session will be automatically picked up by Supabase's onAuthStateChange
    // once the popup redirects back to our origin and sets the session in localStorage.
  }

  return data;
};

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const client = getSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const client = getSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const logout = async () => {
  const client = getSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
};
