import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightTheme, darkTheme } from '../constants/theme'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: typeof lightTheme
  isDark: boolean
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  themeMode: 'system',
  setThemeMode: async () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeModeState(stored)
      }
    })
  }, [])

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark'
  const theme = isDark ? darkTheme : lightTheme

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    await AsyncStorage.setItem('theme_mode', mode)
    setThemeModeState(mode)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
