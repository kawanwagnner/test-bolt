-- Tabela para eventos públicos visíveis a todos
CREATE TABLE IF NOT EXISTS public.public_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Permitir leitura para todos
CREATE POLICY "public_events_select_all" ON public.public_events
  FOR SELECT USING (true);

-- Permitir insert apenas para admin
CREATE POLICY "public_events_insert_admin" ON public.public_events
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Permitir update/delete apenas para admin
CREATE POLICY "public_events_update_admin" ON public.public_events
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
CREATE POLICY "public_events_delete_admin" ON public.public_events
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

ALTER TABLE public.public_events ENABLE ROW LEVEL SECURITY;
