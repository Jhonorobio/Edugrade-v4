import { MD3LightTheme } from 'react-native-paper'

export const Colors = {
  primary: '#8157F9',
  primaryLight: '#A07FF9',
  primaryDark: '#6A3EE0',
  secondary: '#D55E55',
  accent: '#E9AC49',
  success: '#46855A',
  background: '#F3F0EC',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F6F3',
  text: '#262626',
  textSecondary: '#6B6B6B',
  textLight: '#FFFFFF',
  border: '#E8E4DF',
  divider: '#DDD8D2',
  disabled: '#B0ACA8',
  statusActive: '#46855A',
  statusInactive: '#D55E55',
  statusSuspended: '#E9AC49',
  gradeLow: '#D55E55',
  gradeBasic: '#E9AC49',
  gradeHigh: '#8157F9',
  gradeSuperior: '#46855A',
}

export const DarkColors = {
  ...Colors,
  primary: '#A07FF9',
  background: '#1A1A1A',
  surface: '#2A2A2A',
  surfaceVariant: '#333333',
  text: '#F3F0EC',
  textSecondary: '#A0A0A0',
  border: '#3A3A3A',
  divider: '#404040',
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  h3: 20,
  h2: 24,
  h1: 28,
  title: 32,
}

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
}

export const Shadows = {
  sm: {
    shadowColor: '#262626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#262626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#262626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
}

export const Fonts = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semiBold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
}

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryLight,
    secondary: Colors.secondary,
    secondaryContainer: '#F5D5D2',
    tertiary: Colors.accent,
    tertiaryContainer: '#F5E4C0',
    background: Colors.background,
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceVariant,
    error: Colors.secondary,
    onPrimary: Colors.textLight,
    onSecondary: Colors.textLight,
    onBackground: Colors.text,
    onSurface: Colors.text,
    onSurfaceVariant: Colors.textSecondary,
    onError: Colors.textLight,
    outline: Colors.border,
    outlineVariant: Colors.divider,
  },
}

export const darkTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: DarkColors.primary,
    primaryContainer: DarkColors.primary,
    secondary: DarkColors.secondary,
    secondaryContainer: '#5A3A38',
    tertiary: DarkColors.accent,
    tertiaryContainer: '#5A4A20',
    background: DarkColors.background,
    surface: DarkColors.surface,
    surfaceVariant: DarkColors.surfaceVariant,
    error: DarkColors.secondary,
    onPrimary: Colors.textLight,
    onSecondary: Colors.textLight,
    onBackground: DarkColors.text,
    onSurface: DarkColors.text,
    onSurfaceVariant: DarkColors.textSecondary,
    onError: Colors.textLight,
    outline: DarkColors.border,
    outlineVariant: DarkColors.divider,
  },
}

export const Roles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_COLEGIO: 'ADMIN_COLEGIO',
  DOCENTE: 'DOCENTE',
} as const

export type UserRole = keyof typeof Roles
