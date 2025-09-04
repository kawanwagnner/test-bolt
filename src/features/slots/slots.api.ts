import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SlotInsert, SlotUpdate, SlotWithDetails } from './slots.types';

export function useSlotsBySchedule(scheduleId: string) {
  return useQuery({
    queryKey: ['slots', scheduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slots')
        .select(`
          *,
          theme:themes(*),
          assignments(
            id,
            user:profiles!user_id(id, full_name)
          )
        `)
        .eq('schedule_id', scheduleId)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map((slot: any) => ({
        ...slot,
        available_spots: slot.capacity - (slot.assignments?.length || 0),
      })) as SlotWithDetails[];
    },
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SlotInsert) => {
      const { data, error } = await supabase
        .from('slots')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['slots', data.schedule_id] });
    },
  });
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: SlotUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['slots', data.schedule_id] });
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get schedule_id before deletion for cache invalidation
      const { data: slot } = await supabase
        .from('slots')
        .select('schedule_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return slot?.schedule_id;
    },
    onSuccess: (scheduleId) => {
      if (scheduleId) {
        queryClient.invalidateQueries({ queryKey: ['slots', scheduleId] });
      }
    },
  });
}