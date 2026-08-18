import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

export type AppTheme = typeof lightTheme | typeof darkTheme;

export type ThemeMode = 'light' | 'dark';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
