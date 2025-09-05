import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { CreateSlotInviteInput, RespondSlotInviteInput, SlotInvite } from './slotInvites.types';

export function useSlotInvites(slotId: string | null) {
  return useQuery({
    queryKey: ['slot-invites', slotId],
    enabled: !!slotId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slot_invites')
        .select('*')
        .eq('slot_id', slotId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SlotInvite[];
    },
  });
}

export function useMySlotInvites() {
  return useQuery({
    queryKey: ['slot-invites:me'],
    queryFn: async () => {
      // Backend policy filtra pelo email no token
      const { data, error } = await supabase
        .from('slot_invites')
        .select(`*, slot:slots!slot_id(id, title, start_time, end_time, mode, capacity, schedule_id)`)        
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (SlotInvite & { slot: any })[];
    },
  });
}

export function useCreateSlotInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slot_id, email }: CreateSlotInviteInput) => {
      const { data, error } = await supabase
        .from('slot_invites')
        .insert({ slot_id, email })
        .select('*')
        .single();
      if (error) throw error;
      // opcional: enviar magic link
      try { await supabase.auth.signInWithOtp({ email }); } catch {}
      return data as SlotInvite;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['slot-invites', data.slot_id] });
    },
  });
}

export function useRespondSlotInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ invite_id, accept }: RespondSlotInviteInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const updates = accept
        ? { status: 'accepted', accepted_by: user.id, accepted_at: new Date().toISOString() }
        : { status: 'declined' };
      const { data, error } = await supabase
        .from('slot_invites')
        .update(updates)
        .eq('id', invite_id)
        .select('*')
        .single();
      if (error) throw error;
      // assignment será criado via trigger
      return data as SlotInvite;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slot-invites:me'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
