export async function updatePublicEvent(event: Pick<PublicEvent, 'id'> & Partial<Omit<PublicEvent, 'id' | 'created_at'>>) {
  const { id, ...fields } = event;
  const { data, error } = await supabase
    .from('public_events')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as PublicEvent;
}

export async function deletePublicEvent(id: string) {
  const { error } = await supabase
    .from('public_events')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}
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
