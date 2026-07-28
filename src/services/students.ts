import { supabase } from './supabase'
import type { Alumno } from '../types'

export async function getAlumnos(colegioId: string, gradoId?: string) {
  let query = supabase.from('alumnos').select('*, grados(*)').eq('colegio_id', colegioId)
  if (gradoId) query = query.eq('grado_id', gradoId)
  const { data, error } = await query
  if (error) throw error
  return data as (Alumno & { grados: { nombre: string } })[]
}

export async function createAlumno(alumno: Partial<Alumno>) {
  const { data, error } = await supabase.from('alumnos').insert(alumno).select().single()
  if (error) throw error
  return data as Alumno
}

export async function updateAlumno(id: string, updates: Partial<Alumno>) {
  const { data, error } = await supabase
    .from('alumnos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Alumno
}

export async function deleteAlumno(id: string) {
  const { error } = await supabase.from('alumnos').delete().eq('id', id)
  if (error) throw error
}

export async function deleteAlumnos(ids: string[]) {
  const { error } = await supabase.from('alumnos').delete().in('id', ids)
  if (error) throw error
}
