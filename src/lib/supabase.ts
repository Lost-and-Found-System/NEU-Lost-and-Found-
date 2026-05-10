import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Graceful warning — app still runs in offline/demo mode
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Real-time features will not work ' +
    'until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

/**
 * Supabase client instance configured with project URL and anonymous key
 * Includes auth persistence and auto token refresh
 */
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

// ── Auth Helpers ──────────────────────────────────────────────────

/**
 * Signs in a user using Google OAuth provider
 * @returns {Promise<{ data: any; error: Error | null }>} 
 * Returns sign-in data or error object
 * @example
 * const { data, error } = await signInWithGoogle()
 * if (error) {
 *   console.error('Sign in failed:', error)
 * }
 */
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: { prompt: 'select_account' }
      }
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    return { data: null, error };
  }
};

/**
 * Signs out the current authenticated user
 * @returns {Promise<{ error: Error | null }>} 
 * Returns empty data or error object
 * @example
 * await logout()
 */
export const logout = async () => {
  return await supabase.auth.signOut();
};

/**
 * Gets the current active session
 * @returns {Promise<Session | null>} 
 * Returns the session object if authenticated, null otherwise
 * @example
 * const session = await getCurrentSession()
 * if (session) {
 *   console.log('User is logged in')
 * }
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      // Session missing is normal for not signed in users
      if (error.message?.includes('Auth session missing')) {
        return null;
      }
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Gets the current authenticated user
 * @returns {Promise<User | null>} 
 * Returns the user object if authenticated, null otherwise
 * @example
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log(user.email)
 * }
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // Auth session missing is normal for not signed in users
      if (error.message?.includes('Auth session missing')) {
        return null;
      }
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};