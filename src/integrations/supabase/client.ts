import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials as requested for the Yobest AI platform
const supabaseUrl = 'https://kyzjxatlcfypghianon.supabase.co';
const supabaseAnonKey = 'sb_publishable_G-9Txvs0NUn5FYDsTK7_BA_NLA0LFt4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);