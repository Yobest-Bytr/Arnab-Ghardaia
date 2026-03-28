-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Rabbits Table
CREATE TABLE public.rabbits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rabbit_id text NOT NULL,
  name text,
  breed text NOT NULL,
  gender text NOT NULL,
  health_status text DEFAULT 'Healthy',
  status text DEFAULT 'Available',
  cage_number text,
  price numeric DEFAULT 0,
  weight numeric,
  birth_date date,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Litters (Breeding) Table
CREATE TABLE public.litters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  mother_name text NOT NULL,
  father_name text NOT NULL,
  mating_date date NOT NULL,
  expected_birth_date date NOT NULL,
  status text DEFAULT 'Pregnant',
  kit_count integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Auth Codes Table (for verification)
CREATE TABLE public.auth_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rabbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own rabbits" ON public.rabbits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own litters" ON public.litters FOR ALL USING (auth.uid() = user_id);

-- Public access for the shop (optional)
CREATE POLICY "Public can view available rabbits" ON public.rabbits FOR SELECT USING (status = 'Available');