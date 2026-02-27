require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL: Supabase credentials missing from process.env');
    // Don't throw here, allow the app to boot but errors will happen on use
}

const supabase = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

if (!supabase) {
    console.warn('Supabase client not initialized - check env vars');
}

module.exports = supabase;
