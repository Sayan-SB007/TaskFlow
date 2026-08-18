import { colors } from './colors';

export const darkTheme = {
  mode: 'dark' as const,

  colors: colors.dark,

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
  },
};
