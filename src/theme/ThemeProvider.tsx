import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import {
  configureFonts,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  type MD3Theme,
} from 'react-native-paper';
import { darken, lighten } from './color';
import { darkPalette, fonts, lightPalette, type Palette } from './palette';

// Equivalent of live-repo's useJumboTheme() + ThemeModeOption: light by default, and the
// user's light/dark choice is remembered ('system' remains available but isn't the default).
export type ThemeMode = 'system' | 'light' | 'dark';

type AppTheme = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  palette: Palette;
  // Lighten/darken primary itself (not primary.light, which is purple in the
  // dark theme) — same reasoning as the comments in live-repo's Signin.tsx.
  brandLight: string;
  brandDark: string;
  navigationTheme: NavigationTheme;
};

const ThemeContext = createContext<AppTheme | null>(null);

const buildPaperTheme = (palette: Palette, isDark: boolean): MD3Theme => {
  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    roundness: 3,
    fonts: configureFonts({ config: { fontFamily: fonts.regular } }),
    colors: {
      ...base.colors,
      primary: palette.primary,
      onPrimary: palette.primaryContrast,
      secondary: palette.secondary,
      error: palette.error,
      background: palette.background,
      surface: palette.paper,
      onSurface: palette.textPrimary,
      onSurfaceVariant: palette.textSecondary,
      outline: palette.divider,
    },
  };
};

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  // Web (ThemeModeOption.tsx) keeps the choice in localStorage 'theme-type', default 'light'.
  const [mode, setModeState] = useState<ThemeMode>('light');
  useEffect(() => {
    AsyncStorage.getItem('theme-type')
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') setModeState(saved);
      })
      .catch(() => {});
  }, []);
  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    if (next !== 'system') AsyncStorage.setItem('theme-type', next).catch(() => {});
  }, []);
  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo<AppTheme & { paperTheme: MD3Theme }>(() => {
    const palette = isDark ? darkPalette : lightPalette;
    const baseNav = isDark ? NavigationDarkTheme : NavigationLightTheme;
    return {
      mode,
      setMode,
      isDark,
      palette,
      brandLight: lighten(palette.primary, isDark ? 0.45 : 0.3),
      brandDark: darken(palette.primary, 0.3),
      paperTheme: buildPaperTheme(palette, isDark),
      navigationTheme: {
        ...baseNav,
        colors: {
          ...baseNav.colors,
          primary: palette.primary,
          background: palette.background,
          card: palette.paper,
          text: palette.textPrimary,
          border: palette.divider,
        },
      },
    };
  }, [mode, isDark, setMode]);

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={value.paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
};
