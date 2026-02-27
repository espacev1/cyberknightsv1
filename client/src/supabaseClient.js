import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a real client if credentials exist, otherwise a mock for dev
let supabase;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url') {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('⚠️ Supabase credentials not configured. Running in demo mode.');
    // Mock client so the app renders without crashing
    supabase = {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            onAuthStateChange: (cb) => {
                return { data: { subscription: { unsubscribe: () => { } } } };
            },
            signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env' } }),
            signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env' } }),
            signOut: () => Promise.resolve({ error: null }),
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }), order: () => Promise.resolve({ data: [], error: null }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        }),
    };
}

export { supabase };
