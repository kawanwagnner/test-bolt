import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermissions, setupNotificationChannel } from '@/lib/notifications';

// Create a client with offline persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setup notifications on app start
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      await requestNotificationPermissions();
      await setupNotificationChannel();
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}