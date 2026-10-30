import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'color_scheme';

const themes = {
  dark: {
    colors: {
      background: '#0D0D0D',
      surface: '#1A1A1A',
      primary: '#E8DCC8',
      accent: '#C4A46B',
      text: '#F5F0E8',
      textSecondary: '#8A8278',
      divider: '#2A2520',
    },
    fonts: {
      mono: 'Courier',
    },
  },
  light: {
    colors: {
      background: '#F7F2E8',
      surface: '#EDE4D3',
      primary: '#4A3825',
      accent: '#9A6B2F',
      text: '#30271F',
      textSecondary: '#746553',
      divider: '#D8CBB6',
    },
    fonts: {
      mono: 'Courier',
    },
  },
} as const;

export type ColorScheme = keyof typeof themes;
export type ThemePreference = ColorScheme | 'auto';
export type AppTheme = (typeof themes)[ColorScheme];

interface ThemeContextValue {
  colorScheme: ColorScheme;
  themePreference: ThemePreference;
  setColorScheme: (scheme: ThemePreference) => Promise<void>;
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const systemColorScheme = useSystemColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('dark');
  const colorScheme = themePreference === 'auto'
    ? (systemColorScheme === 'light' ? 'light' : 'dark')
    : themePreference;

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'dark' || saved === 'light' || saved === 'auto') {
          setThemePreference(saved);
        }
      })
      .catch(() => {
        Alert.alert('Theme unavailable', 'Could not load your color theme preference.');
      });
  }, []);

  const setColorScheme = useCallback(async (scheme: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setThemePreference(scheme);
    } catch {
      Alert.alert('Theme not saved', 'Could not save your color theme preference.');
    }
  }, []);

  const value = useMemo(
    () => ({
      colorScheme,
      themePreference,
      setColorScheme,
      theme: themes[colorScheme],
    }),
    [colorScheme, setColorScheme, themePreference],
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
