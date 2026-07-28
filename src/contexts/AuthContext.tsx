import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loginWithUsername, logout as logoutService, getCurrentUser } from '../services/auth'
import type { Usuario } from '../types'

interface AuthContextType {
  usuario: Usuario | null
  loading: boolean
  initialized: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  loading: false,
  initialized: false,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const user = await getCurrentUser()
      setUsuario(user)
    } catch {
      setUsuario(null)
    } finally {
      setInitialized(true)
    }
  }

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    try {
      const { usuario: user } = await loginWithUsername(username, password)
      setUsuario(user)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await logoutService()
      await AsyncStorage.removeItem('colegio_activo')
      setUsuario(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, loading, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
