import 'dotenv/config';

export default {
  expo: {
    name: 'EscalasApp',
    slug: 'escalas-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'escalas',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
  supportsTablet: true,
  // inferred bundle identifier — change if you have a different reverse-domain identifier
  bundleIdentifier: 'com.kawanwnn.escalasapp',
    },
    android: {
  // inferred package name — change if you have a different reverse-domain identifier
  package: 'com.kawanwnn.escalasapp',
      adaptiveIcon: {
        foregroundImage: './assets/images/favicon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    updates: {
      url: 'https://u.expo.dev/5ea64157-7087-4d8d-b0dc-9397afec56f8',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-secure-store',
      'expo-notifications',
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#ffffff',
          defaultChannel: 'default',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: '5ea64157-7087-4d8d-b0dc-9397afec56f8',
      },
    },
  },
};