import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider } from 'react-native-paper'
import { useFonts, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend'
import { AuthProvider } from '../src/contexts/AuthContext'
import { SchoolProvider } from '../src/contexts/SchoolContext'
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '../src/contexts/AuthContext'
import { Colors } from '../src/constants/theme'

function RootLayoutInner() {
  const { initialized } = useAuth()
  const { theme, isDark } = useTheme()
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  })

  if (!initialized || !fontsLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
