import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/src/features/auth/useAuth';
import { useNotification } from '@/src/providers/notifications/NotificationProvider';
import { LoadingSpinner } from './LoadingSpinner';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { initialized: notificationsInitialized } = useNotification();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until both auth has finished loading and notifications provider
    // has completed its initial setup before performing redirects.
    if (loading || !notificationsInitialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if already authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, loading, notificationsInitialized]);

  if (loading || !notificationsInitialized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
