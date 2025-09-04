import { Database } from '@/lib/supabase';

export type Slot = Database['public']['Tables']['slots']['Row'];
export type SlotInsert = Database['public']['Tables']['slots']['Insert'];
export type SlotUpdate = Database['public']['Tables']['slots']['Update'];

export interface SlotWithDetails extends Slot {
  theme?: {
    name: string;
    description: string;
  };
  assignments: {
    id: string;
    user: {
      id: string;
      full_name: string;
    };
  }[];
  available_spots: number;
}