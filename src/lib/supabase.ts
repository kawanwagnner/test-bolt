import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: 'admin' | 'member';
          is_teacher: boolean;
          is_musician: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: 'admin' | 'member';
          is_teacher?: boolean;
          is_musician?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: 'admin' | 'member';
          is_teacher?: boolean;
          is_musician?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          notify_24h: boolean;
          notify_48h: boolean; // professores
          notify_48h_musician: boolean; // músicos
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          notify_24h?: boolean;
          notify_48h?: boolean;
          notify_48h_musician?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          notify_24h?: boolean;
          notify_48h?: boolean;
          notify_48h_musician?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      slots: {
        Row: {
          id: string;
          schedule_id: string;
          theme_id: string | null;
          date: string | null; // new: separate slot date (YYYY-MM-DD)
          start_time: string | null;
          end_time: string | null;
          mode: 'manual' | 'livre';
          capacity: number;
          title: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          theme_id?: string | null;
          date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          mode?: 'manual' | 'livre';
          capacity?: number;
          title?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          theme_id?: string | null;
          date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          mode?: 'manual' | 'livre';
          capacity?: number;
          title?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          slot_id: string;
          user_id: string;
          assigned_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          user_id: string;
          assigned_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          user_id?: string;
          assigned_by?: string | null;
          created_at?: string;
        };
      };
      slot_invites: {
        Row: {
          id: string;
          slot_id: string;
          email: string;
          status: 'pending' | 'accepted' | 'declined';
          token: string;
          created_by: string | null;
          accepted_by: string | null;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          slot_id: string;
          email: string;
          status?: 'pending' | 'accepted' | 'declined';
          token?: string;
          created_by?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          slot_id?: string;
          email?: string;
          status?: 'pending' | 'accepted' | 'declined';
          token?: string;
          created_by?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          accepted_at?: string | null;
        };
      };
    };
  };
};