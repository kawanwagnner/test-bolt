import { Database } from '@/lib/supabase';

export type Schedule = Database['public']['Tables']['schedules']['Row'];
export type ScheduleInsert = Database['public']['Tables']['schedules']['Insert'];
export type ScheduleUpdate = Database['public']['Tables']['schedules']['Update'];

export interface ScheduleWithCreator extends Schedule {
  created_by_profile?: {
    full_name: string;
  };
}