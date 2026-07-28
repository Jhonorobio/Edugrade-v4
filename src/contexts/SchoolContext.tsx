import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from './AuthContext'
import { getColegios, getUsuarioColegios } from '../services/schools'
import type { Colegio } from '../types'

interface SchoolContextType {
  colegioActivo: Colegio | null
  colegiosDisponibles: Colegio[]
  setColegioActivo: (colegio: Colegio) => Promise<void>
  loading: boolean
}

const SchoolContext = createContext<SchoolContextType>({
  colegioActivo: null,
  colegiosDisponibles: [],
  setColegioActivo: async () => {},
  loading: false,
})

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth()
  const [colegioActivo, setColegioActivoState] = useState<Colegio | null>(null)
  const [colegiosDisponibles, setColegiosDisponibles] = useState<Colegio[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (usuario) {
      loadColegios()
    } else {
      setColegiosDisponibles([])
      setColegioActivoState(null)
    }
  }, [usuario])

  async function loadColegios() {
    setLoading(true)
    try {
      if (usuario?.rol === 'SUPER_ADMIN') {
        const colegios = await getColegios()
        setColegiosDisponibles(colegios)
        const storedId = await AsyncStorage.getItem('colegio_activo')
        const found = colegios.find((c) => c.id === storedId)
        if (found) setColegioActivoState(found)
      } else {
        const asignaciones = await getUsuarioColegios(usuario!.id)
        const colegios = asignaciones.map((a: any) => a.colegios)
        setColegiosDisponibles(colegios)
        if (colegios.length > 0) {
          const storedId = await AsyncStorage.getItem('colegio_activo')
          const found = colegios.find((c) => c.id === storedId)
          setColegioActivoState(found || colegios[0])
        }
      }
    } catch (e) {
      console.error('Error loading schools:', e)
    } finally {
      setLoading(false)
    }
  }

  const setColegioActivo = useCallback(async (colegio: Colegio) => {
    await AsyncStorage.setItem('colegio_activo', colegio.id)
    setColegioActivoState(colegio)
  }, [])

  return (
    <SchoolContext.Provider value={{ colegioActivo, colegiosDisponibles, setColegioActivo, loading }}>
      {children}
    </SchoolContext.Provider>
  )
}

export const useSchool = () => useContext(SchoolContext)
