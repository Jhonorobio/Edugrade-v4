import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper'

export const Colors = {
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  primaryDark: '#0D3B0F',
  secondary: '#1565C0',
  secondaryLight: '#42A5F5',
  accent: '#FF6F00',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#D32F2F',
  warning: '#F57C00',
  success: '#388E3C',
  info: '#1976D2',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  border: '#E0E0E0',
  divider: '#BDBDBD',
  disabled: '#9E9E9E',
  statusActive: '#4CAF50',
  statusInactive: '#F44336',
  statusSuspended: '#FF9800',
  gradeLow: '#F44336',
  gradeBasic: '#FF9800',
  gradeHigh: '#FFC107',
  gradeSuperior: '#4CAF50',
}

export const DarkColors = {
  ...Colors,
  primary: '#66BB6A',
  primaryDark: '#4CAF50',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#E0E0E0',
  textSecondary: '#9E9E9E',
  border: '#333333',
  divider: '#424242',
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
  xxxl: 28,
  title: 32,
}

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
}

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
}

const fontConfig = {
  fontFamily: 'System',
}

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryLight,
    secondary: Colors.secondary,
    secondaryContainer: Colors.secondaryLight,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.error,
    onPrimary: Colors.textLight,
    onSecondary: Colors.textLight,
    onBackground: Colors.text,
    onSurface: Colors.text,
    onError: Colors.textLight,
  },
}

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: DarkColors.primary,
    primaryContainer: DarkColors.primaryDark,
    secondary: DarkColors.secondary,
    secondaryContainer: DarkColors.secondaryLight,
    background: DarkColors.background,
    surface: DarkColors.surface,
    error: DarkColors.error,
    onPrimary: Colors.textLight,
    onSecondary: Colors.textLight,
    onBackground: DarkColors.text,
    onSurface: DarkColors.text,
    onError: Colors.textLight,
  },
}

export const Roles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_COLEGIO: 'ADMIN_COLEGIO',
  DOCENTE: 'DOCENTE',
} as const

export type UserRole = keyof typeof Roles
