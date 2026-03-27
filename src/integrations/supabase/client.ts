import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyzjxatlcfypghkianon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5emp4YXRsY2Z5cGdoa2lhbm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDE1MDAsImV4cCI6MjA4NjE3NzUwMH0.51ER2CJiteEQpnRUv-osXTBQ0BuYlkt55TbgIyMykzU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);