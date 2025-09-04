import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { AuthUser, Profile } from './auth.types';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserFromSession(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await setUserFromSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          await storage.removeItem('session');
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const setUserFromSession = async (session: Session) => {
    try {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        profile: profile as Profile,
      };

      setUser(authUser);
      await storage.setItem('session', JSON.stringify(session));
    } catch (error) {
      console.error('Error setting user from session:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    // Refresh user data
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      await setUserFromSession(session.data.session);
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin: user?.profile?.role === 'admin',
    isTeacher: user?.profile?.is_teacher || false,
  };
}