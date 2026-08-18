import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { lightTheme } from '../../theme/lightTheme';
import { darkTheme } from '../../theme/darkTheme';

export type ThemeMode = 'light' | 'dark';

type AppTheme = typeof lightTheme | typeof darkTheme;

interface ThemeContextValue {
  mode: ThemeMode;
  theme: AppTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,

      theme,

      setMode,

      isDark: mode === 'dark',

      toggleTheme: () => {
        setMode(current => (current === 'dark' ? 'light' : 'dark'));
      },
    }),

    [mode, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
