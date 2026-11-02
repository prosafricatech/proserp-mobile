// Ported from live-repo src/themes/main/default.ts (light) and dark.ts (dark).
export type Palette = {
  primary: string;
  primaryContrast: string;
  secondary: string;
  error: string;
  success: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  paper: string;
  background: string;
};

export const lightPalette: Palette = {
  primary: '#2113AD',
  primaryContrast: '#FFFFFF',
  secondary: '#E44A77',
  error: '#E73145',
  success: '#0f8507',
  textPrimary: '#475259',
  textSecondary: '#8595A6',
  divider: '#DEE2E6',
  paper: '#FFFFFF',
  background: '#F5F7FA',
};

export const darkPalette: Palette = {
  primary: '#2196f3',
  primaryContrast: '#FFFFFF',
  secondary: '#E44A77',
  error: '#E73145',
  success: '#3BD2A2',
  textPrimary: '#C5CDE6',
  textSecondary: '#9da9b7',
  divider: 'rgba(255,255,255,0.3)',
  paper: '#26324D',
  background: '#19243B',
};

export const fonts = {
  regular: 'NoirPro-Regular',
  medium: 'NoirPro-Medium',
  semiBold: 'NoirPro-SemiBold',
  bold: 'NoirPro-Bold',
};
