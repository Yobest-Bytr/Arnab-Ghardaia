-- Ensure auth_codes table is correctly structured
CREATE TABLE IF NOT EXISTS auth_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid, 
  email text NOT NULL,
  code text NOT NULL,
  purpose text DEFAULT 'email_verification',
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Enable insert for all" ON auth_codes;
CREATE POLICY "Enable insert for all" ON auth_codes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for all" ON auth_codes;
CREATE POLICY "Enable delete for all" ON auth_codes FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable select for all" ON auth_codes;
CREATE POLICY "Enable select for all" ON auth_codes FOR SELECT USING (true);