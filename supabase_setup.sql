-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Rabbits Table (Core Inventory)
CREATE TABLE IF NOT EXISTS rabbits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rabbit_id TEXT NOT NULL,
  name TEXT,
  breed TEXT,
  gender TEXT,
  color TEXT,
  origin TEXT,
  health_status TEXT DEFAULT 'Healthy',
  status TEXT DEFAULT 'Available',
  cage_number TEXT,
  cage_type TEXT,
  price_dzd NUMERIC,
  weight NUMERIC,
  birth_date DATE,
  notes TEXT,
  mother_id TEXT,
  father_id TEXT,
  mating_partner TEXT,
  vaccination_status TEXT DEFAULT 'Not Vaccinated',
  medical_history TEXT,
  weight_history JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Litters Table (Breeding Records)
CREATE TABLE IF NOT EXISTS litters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  mother_name TEXT,
  father_name TEXT,
  mating_date DATE,
  expected_birth_date DATE,
  actual_birth_date DATE,
  kit_count INTEGER DEFAULT 0,
  alive_kits INTEGER DEFAULT 0,
  dead_kits INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Pregnant',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mating History Table (Detailed Tracking)
CREATE TABLE IF NOT EXISTS mating_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  female_id UUID REFERENCES rabbits(id) ON DELETE CASCADE,
  male_id UUID REFERENCES rabbits(id) ON DELETE CASCADE,
  mating_date DATE,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Weight Logs Table (Growth Tracking)
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rabbit_id UUID REFERENCES rabbits(id) ON DELETE CASCADE,
  weight NUMERIC,
  log_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rabbit_id UUID REFERENCES rabbits(id) ON DELETE SET NULL,
  customer_name TEXT,
  price NUMERIC,
  sale_date DATE,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  category TEXT,
  amount NUMERIC,
  date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT,
  category TEXT,
  priority TEXT,
  due_date DATE,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rabbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE mating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (User can only see their own data)
CREATE POLICY "Users can manage their own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own rabbits" ON rabbits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own litters" ON litters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own mating history" ON mating_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own weight logs" ON weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sales" ON sales FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Public access for Boutique
CREATE POLICY "Public can view public rabbits" ON rabbits FOR SELECT USING (is_public = TRUE);