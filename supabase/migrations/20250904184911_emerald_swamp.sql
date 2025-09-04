/*
# EscalasApp Database Schema

1. New Tables
   - `profiles` - User profiles with roles (admin/member)
   - `schedules` - Schedule periods with titles, dates, and notification settings
   - `themes` - Reusable themes/tasks for schedules
   - `slots` - Time slots within schedules with capacity and assignment modes
   - `assignments` - User assignments to specific slots

2. Security
   - Enable RLS on all tables
   - Admin policies for CRUD operations on schedules, slots, themes
   - Member policies for reading and self-assignment to free slots
   - Profile policies for reading own data and admin access to all

3. Features
   - Role-based access control (admin/member)
   - Manual and free assignment modes
   - Notification scheduling (24h/48h before)
   - Real-time updates support
*/

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.themes ENABLE ROW LEVEL SECURITY;

-- Profiles table (user roles and info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text CHECK (role IN ('admin','member')) DEFAULT 'member',
  is_teacher boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Themes table (reusable themes/tasks)
CREATE TABLE IF NOT EXISTS public.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Schedules table (schedule periods)
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  notify_24h boolean DEFAULT true,
  notify_48h boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Slots table (time slots within schedules)
CREATE TABLE IF NOT EXISTS public.slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  theme_id uuid REFERENCES public.themes(id),
  start_time timestamptz,
  end_time timestamptz,
  mode text CHECK (mode IN ('manual','livre')) NOT NULL DEFAULT 'livre',
  capacity integer NOT NULL DEFAULT 1,
  title text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assignments table (user assignments to slots)
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE (slot_id, user_id)
);

-- Insert some default themes
INSERT INTO public.themes (name, description) VALUES 
  ('Apresentação', 'Apresentação de trabalho ou projeto'),
  ('Leitura', 'Leitura de texto ou material'),
  ('Coordenação', 'Coordenação de atividade ou discussão'),
  ('Relatoria', 'Relatoria de discussão ou atividade')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies for profiles
CREATE POLICY "profiles_read_own_or_admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for schedules
CREATE POLICY "schedules_select_all" ON public.schedules
  FOR SELECT USING (true);

CREATE POLICY "schedules_insert_admin" ON public.schedules
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "schedules_update_admin" ON public.schedules
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "schedules_delete_admin" ON public.schedules
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for themes
CREATE POLICY "themes_select_all" ON public.themes
  FOR SELECT USING (true);

CREATE POLICY "themes_insert_admin" ON public.themes
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "themes_update_admin" ON public.themes
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "themes_delete_admin" ON public.themes
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for slots
CREATE POLICY "slots_select_all" ON public.slots
  FOR SELECT USING (true);

CREATE POLICY "slots_insert_admin" ON public.slots
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "slots_update_admin" ON public.slots
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "slots_delete_admin" ON public.slots
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for assignments
CREATE POLICY "assignments_select_all" ON public.assignments
  FOR SELECT USING (true);

CREATE POLICY "assignments_insert_free_or_admin" ON public.assignments
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id AND 
     EXISTS(SELECT 1 FROM public.slots s WHERE s.id = slot_id AND s.mode = 'livre' AND 
            (SELECT COUNT(*) FROM public.assignments a WHERE a.slot_id = slot_id) < s.capacity))
    OR
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "assignments_delete_own_or_admin" ON public.assignments
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.email LIKE '%@admin.test' THEN 'admin'
      ELSE 'member'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_slot_id ON public.assignments(slot_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_slots_schedule_id ON public.slots(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON public.schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_created_by ON public.schedules(created_by);