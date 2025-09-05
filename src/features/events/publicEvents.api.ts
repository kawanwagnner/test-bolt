import { supabase } from '@/src/lib/supabase';

export type PublicEvent = {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  description?: string;
  created_by: string;
  created_at: string;
};

export async function fetchPublicEvents() {
  const { data, error } = await supabase
    .from('public_events')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data as PublicEvent[];
}

export async function addPublicEvent(event: Omit<PublicEvent, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('public_events')
    .insert([event])
    .select()
    .single();
  if (error) throw error;
  return data as PublicEvent;
}
