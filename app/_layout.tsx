import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/src/providers/AppProvider';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthWrapper } from '@/src/components/AuthWrapper';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProvider>
      <AuthWrapper>
        <Slot />
        <StatusBar style="auto" />
      </AuthWrapper>
    </AppProvider>
  );
}
