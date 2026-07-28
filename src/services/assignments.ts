import { supabase } from './supabase'
import type { AsignacionDocente } from '../types'

export async function getAsignaciones(colegioId: string) {
  const { data, error } = await supabase
    .from('asignaciones_docentes')
    .select('*, usuarios(*), materias(*), grados(*)')
    .eq('colegio_id', colegioId)
  if (error) throw error
  return data
}

export async function createAsignacion(asignacion: Partial<AsignacionDocente>) {
  const { data, error } = await supabase
    .from('asignaciones_docentes')
    .insert(asignacion)
    .select()
    .single()
  if (error) throw error
  return data as AsignacionDocente
}

export async function deleteAsignacion(id: string) {
  const { error } = await supabase.from('asignaciones_docentes').delete().eq('id', id)
  if (error) throw error
}

export async function getDocentesByGrado(gradoId: string, colegioId: string) {
  const { data, error } = await supabase
    .from('asignaciones_docentes')
    .select('*, usuarios(*)')
    .eq('grado_id', gradoId)
    .eq('colegio_id', colegioId)
  if (error) throw error
  return data
}
