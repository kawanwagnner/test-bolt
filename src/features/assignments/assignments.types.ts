import { Database } from '@/src/lib/supabase';

export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type AssignmentInsert = Database['public']['Tables']['assignments']['Insert'];

export interface AssignmentWithDetails extends Assignment {
  id: string;
  slot: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    schedule: {
      id: string;
      title: string;
      date: string;
    };
  };
}