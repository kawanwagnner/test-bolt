import { Database } from '@/lib/supabase';

export type Theme = Database['public']['Tables']['themes']['Row'];
export type ThemeInsert = Database['public']['Tables']['themes']['Insert'];
export type ThemeUpdate = Database['public']['Tables']['themes']['Update'];