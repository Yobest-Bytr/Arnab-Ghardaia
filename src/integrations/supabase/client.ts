import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyzjxatlcfypghkianon.supabase.co';
const supabaseAnonKey = 'sb_publishable_G-9Txvs0NUn5FYDsTK7_BA_NLA0LFt4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);