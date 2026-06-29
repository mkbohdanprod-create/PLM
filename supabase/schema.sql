-- Clean up previous schema if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS "schedules" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "profiles" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TYPE IF EXISTS "order_status" CASCADE;

-- Create custom types
CREATE TYPE order_status AS ENUM (
  'DRAFT', 'NEW', 'MEASUREMENT_SCHEDULING', 'MEASUREMENT_SCHEDULED', 
  'MEASUREMENT_COMPLETED', 'REMEASUREMENT_NEEDED', 'ENGINEERING_DESIGN', 
  'ENGINEERING_NESTING', 'CLIENT_APPROVAL', 'PRODUCTION_QUEUE', 
  'IN_PRODUCTION', 'PRODUCTION_COMPLETED', 'INSTALLATION_SCHEDULING', 
  'INSTALLATION_SCHEDULED', 'COMPLETED', 'PAUSED', 'CANCELLED'
);

-- Roles table
CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  allowed_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin role
INSERT INTO roles (name, allowed_modules) VALUES 
('Адмін', '["Планування замірів", "Заміри (AppSheet)", "Конструктив", "Виробництво (MES)", "Планування доставок", "Доставка", "Планування монтажів", "Монтажі (AppSheet)", "Моніторинг замовлень", "Графіки роботи", "Розрахунок ЗП", "Співробітники", "Налаштування ролей"]'::jsonb);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  sub_role TEXT,
  rank TEXT,
  phone TEXT,
  color TEXT,
  specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  address TEXT NOT NULL,
  time TEXT,
  status order_status NOT NULL DEFAULT 'NEW',
  phone TEXT,
  area TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  material TEXT,
  region TEXT,
  order_type TEXT,
  is_subtask BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules table
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, date)
);

-- Row Level Security (RLS) Setup
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Roles RLS
CREATE POLICY "Roles viewable by everyone" ON roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Roles editable by everyone" ON roles FOR ALL USING (auth.role() = 'authenticated');

-- Allow users to read all profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
-- Only admins can update profiles (for now, allow users to update their own)
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders RLS (Basic: everyone authenticated can see and edit for now)
CREATE POLICY "Orders are viewable by authenticated users" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Orders are editable by authenticated users" ON orders FOR ALL USING (auth.role() = 'authenticated');

-- Schedules RLS
CREATE POLICY "Schedules viewable by everyone" ON schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Schedules editable by everyone" ON schedules FOR ALL USING (auth.role() = 'authenticated');

-- Trigger to create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    (SELECT id FROM roles WHERE name = 'Адмін' LIMIT 1) -- Assigning Admin role by default for initial setup
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
