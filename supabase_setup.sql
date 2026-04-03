-- Ensure the rabbits table exists with correct data types
CREATE TABLE IF NOT EXISTS public.rabbits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    rabbit_id TEXT NOT NULL,
    name TEXT NOT NULL,
    breed TEXT,
    gender TEXT,
    color TEXT,
    origin TEXT,
    health_status TEXT DEFAULT 'Healthy',
    status TEXT DEFAULT 'Available',
    cage_number TEXT,
    cage_type TEXT,
    price_dzd NUMERIC DEFAULT 0,
    weight NUMERIC DEFAULT 0,
    birth_date DATE,
    notes TEXT,
    mother_id TEXT, -- Changed to TEXT to support custom IDs/Names
    father_id TEXT, -- Changed to TEXT to support custom IDs/Names
    mating_partner TEXT,
    vaccination_status TEXT DEFAULT 'Not Vaccinated',
    medical_history TEXT,
    weight_history JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure litters table exists
CREATE TABLE IF NOT EXISTS public.litters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rabbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.litters ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own rabbits" ON public.rabbits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own litters" ON public.litters
    FOR ALL USING (auth.uid() = user_id);