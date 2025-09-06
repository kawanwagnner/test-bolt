import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';

export type Announcement = {
  id: string;
  title: string;
  message: string | null;
  created_by: string | null;
  created_at: string;
};

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, message }: { title: string; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('announcements')
        .insert({ title, message, created_by: user?.id })
        .select('*')
        .single();
      if (error) throw error;
      return data as Announcement;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
