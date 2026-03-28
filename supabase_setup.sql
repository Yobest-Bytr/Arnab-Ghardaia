-- Create Rabbits Table
CREATE TABLE IF NOT EXISTS rabbits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  rabbit_id text,
  name text,
  breed text,
  gender text,
  health_status text,
  status text,
  cage_number text,
  price numeric,
  weight numeric,
  birth_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create Litters Table
CREATE TABLE IF NOT EXISTS litters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  mother_name text,
  father_name text,
  mating_date date,
  expected_birth_date date,
  kit_count integer,
  status text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE rabbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all for demo/authenticated users)
CREATE POLICY "Allow all for owners" ON rabbits FOR ALL USING (true);
CREATE POLICY "Allow all for owners" ON litters FOR ALL USING (true);