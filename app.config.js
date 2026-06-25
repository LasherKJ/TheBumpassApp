export default {
  expo: {
    owner: 'kevinjlasher',
    extra: {
      eas: {
        projectId: 'f24c378a-f319-443b-b315-70b24333a1e1',
      },
    },
    plugins: [
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Bumpass uses your location to show direction and distance to your destination.',
        },
      ],
    ],
    name: 'Bumpass',
    slug: 'bumpass-app',
    version: '1.2.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      bundleIdentifier: 'com.kevinlasher.bumpass.app',
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
};
