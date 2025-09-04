import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AssignmentInsert, AssignmentWithDetails } from './assignments.types';
import { scheduleAssignmentNotifications, cancelAssignmentNotifications } from '@/lib/notifications';

export function useMyAssignments() {
  return useQuery({
    queryKey: ['assignments:me'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          slot:slots!slot_id(
            id, title, start_time, end_time,
            schedule:schedules!schedule_id(id, title, date)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AssignmentWithDetails[];
    },
  });
}

export function useAssignToSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AssignmentInsert) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert(input)
        .select(`
          *,
          slot:slots!slot_id(
            title, start_time,
            schedule:schedules!schedule_id(title)
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      const slot = data.slot as any;
      
      // Schedule notifications
      if (slot?.start_time) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_teacher')
          .eq('id', user?.id)
          .single();

        await scheduleAssignmentNotifications(
          new Date(slot.start_time),
          slot.title || slot.schedule?.title || 'Escala',
          profile?.is_teacher || false,
          data.id
        );
      }

      queryClient.invalidateQueries({ queryKey: ['assignments:me'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useUnassignFromSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      return assignmentId;
    },
    onSuccess: async (assignmentId) => {
      await cancelAssignmentNotifications(assignmentId);
      queryClient.invalidateQueries({ queryKey: ['assignments:me'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}