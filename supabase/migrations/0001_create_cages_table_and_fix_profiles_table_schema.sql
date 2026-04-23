-- Create cages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'Empty',
  capacity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on cages
ALTER TABLE public.cages ENABLE ROW LEVEL SECURITY;

-- Create policies for cages
CREATE POLICY "cages_select_policy" ON public.cages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cages_insert_policy" ON public.cages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cages_update_policy" ON public.cages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cages_delete_policy" ON public.cages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix profiles table (ensure display_name and other columns exist)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'openai';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure policies exist for profiles (using id as the user reference)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy') THEN
        CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_policy') THEN
        CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_policy') THEN
        CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
    END IF;
END $$;
