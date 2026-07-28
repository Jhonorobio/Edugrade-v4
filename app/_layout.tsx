import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider } from 'react-native-paper'
import { AuthProvider } from '../src/contexts/AuthContext'
import { SchoolProvider } from '../src/contexts/SchoolContext'
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '../src/contexts/AuthContext'

function RootLayoutInner() {
  const { initialized } = useAuth()
  const { theme, isDark } = useTheme()

  if (!initialized) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </PaperProvider>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SchoolProvider>
          <RootLayoutInner />
        </SchoolProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
