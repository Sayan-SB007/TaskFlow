import {colors} from './colors';

export const lightTheme = {
  mode: 'light' as const,

  colors: colors.light,

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
  },
};