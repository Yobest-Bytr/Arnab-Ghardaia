-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Rabbits Table
CREATE TABLE IF NOT EXISTS rabbits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  rabbit_id text NOT NULL,
  name text,
  breed text,
  gender text,
  health_status text,
  status text,
  sale_category text,
  cage_number text,
  price_dzd text,
  weight text,
  birth_date timestamp with time zone,
  notes text,
  mother_id text,
  father_id text,
  vaccination_status text,
  medical_history text,
  weight_history jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Litters (Breeding) Table
CREATE TABLE IF NOT EXISTS litters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mother_name text,
  father_name text,
  mating_date timestamp with time zone,
  expected_birth_date timestamp with time zone,
  kit_count integer DEFAULT 0,
  status text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  rabbit_id uuid REFERENCES rabbits(id) ON DELETE SET NULL,
  customer_name text,
  price numeric,
  sale_date timestamp with time zone,
  category text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rabbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own rabbits" ON rabbits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own litters" ON litters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sales" ON sales FOR ALL USING (auth.uid() = user_id);