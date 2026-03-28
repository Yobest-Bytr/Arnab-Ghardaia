-- 1. Auth Codes Table
CREATE TABLE IF NOT EXISTS auth_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid, -- Can be null for reset requests
  email text NOT NULL,
  code text NOT NULL,
  purpose text DEFAULT 'email_verification',
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Profiles Table (Prevents 404 errors)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for auth_codes (Service role handles most, but allow public insert for signup)
CREATE POLICY "Enable insert for all" ON auth_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for all" ON auth_codes FOR DELETE USING (true);

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- 3. Trigger to auto-create profile on signup (Stable way to map email -> id)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();