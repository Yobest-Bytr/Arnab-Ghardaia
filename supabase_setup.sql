-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rabbits Table
CREATE TABLE IF NOT EXISTS rabbits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rabbit_id TEXT NOT NULL,
  name TEXT NOT NULL,
  breed TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  color TEXT,
  origin TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  status TEXT DEFAULT 'Available',
  health_status TEXT DEFAULT 'Healthy',
  cage_number TEXT,
  cage_type TEXT,
  price_dzd DECIMAL(10,2),
  mother_id TEXT,
  father_id TEXT,
  mating_partner TEXT,
  vaccination_status TEXT,
  medical_history TEXT,
  notes TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mating History Table (New: Tracks multiple matings per female)
CREATE TABLE IF NOT EXISTS mating_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  female_id UUID REFERENCES rabbits(id) ON DELETE CASCADE,
  male_id UUID REFERENCES rabbits(id) ON DELETE CASCADE,
  mating_date DATE NOT NULL,
  expected_birth_date DATE,
  status TEXT DEFAULT 'Pending', -- Pending, Pregnant, Failed, Born
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight Logs Table (New: Tracks growth over time)
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rabbit_id UUID REFERENCES rabbits(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Litters Table
CREATE TABLE IF NOT EXISTS litters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  mother_name TEXT,
  father_name TEXT,
  mating_date DATE,
  expected_birth_date DATE,
  actual_birth_date DATE,
  kit_count INTEGER DEFAULT 0,
  alive_kits INTEGER DEFAULT 0,
  dead_kits INTEGER DEFAULT 0,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rabbit_id TEXT,
  customer_name TEXT,
  price DECIMAL(10,2),
  sale_date DATE,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  category TEXT,
  amount DECIMAL(10,2),
  date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  due_date DATE,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Enable Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rabbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE mating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for each table (Example for rabbits)
CREATE POLICY "Users can only access their own rabbits" ON rabbits
  FOR ALL USING (auth.uid() = user_id);
-- (Repeat for other tables...)