import { supabase } from './supabase'
import type { Grado, Materia } from '../types'

export async function getGrados(colegioId: string) {
  const { data, error } = await supabase
    .from('grados')
    .select('*')
    .eq('colegio_id', colegioId)
  if (error) throw error
  return data as Grado[]
}

export async function createGrado(grado: Partial<Grado>) {
  const { data, error } = await supabase.from('grados').insert(grado).select().single()
  if (error) throw error
  return data as Grado
}

export async function updateGrado(id: string, updates: Partial<Grado>) {
  const { data, error } = await supabase
    .from('grados')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Grado
}

export async function deleteGrado(id: string) {
  const { error } = await supabase.from('grados').delete().eq('id', id)
  if (error) throw error
}

export async function getMaterias() {
  const { data, error } = await supabase.from('materias').select('*')
  if (error) throw error
  return data as Materia[]
}

export async function createMateria(materia: Partial<Materia>) {
  const { data, error } = await supabase.from('materias').insert(materia).select().single()
  if (error) throw error
  return data as Materia
}

export async function updateMateria(id: string, updates: Partial<Materia>) {
  const { data, error } = await supabase
    .from('materias')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Materia
}

export async function deleteMateria(id: string) {
  const { error } = await supabase.from('materias').delete().eq('id', id)
  if (error) throw error
}
