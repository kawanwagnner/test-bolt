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
      // keep build number in sync with version
      buildNumber: '1',
    },
    android: {
      // inferred package name — change if you have a different reverse-domain identifier
      package: 'com.kawanwnn.escalasapp',
      // explicit versionCode can help with CI and reproducible builds
      versionCode: 1,
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
    // bundle static assets with the app to avoid runtime fetches
    assetBundlePatterns: ['**/*'],
    // splash screen for a smoother startup on native platforms
    splash: {
      image: './assets/images/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      url: 'https://u.expo.dev/5ea64157-7087-4d8d-b0dc-9397afec56f8',
      // fallbackToCacheTimeout controls how long the app waits for remote updates
      // 0 = immediately use cached bundle if available; tweak if you want network-first
      fallbackToCacheTimeout: 0,
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