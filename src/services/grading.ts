import { supabase } from './supabase'
import type { Actividad, Calificacion, InformeCualitativo } from '../types'

export async function getActividades(materiaId: string, gradoId: string, periodo: number, colegioId: string) {
  const { data, error } = await supabase
    .from('actividades')
    .select('*')
    .eq('materia_id', materiaId)
    .eq('grado_id', gradoId)
    .eq('periodo', periodo)
    .eq('colegio_id', colegioId)
  if (error) throw error
  return data as Actividad[]
}

export async function createActividad(actividad: Partial<Actividad>) {
  const { data, error } = await supabase.from('actividades').insert(actividad).select().single()
  if (error) throw error
  return data as Actividad
}

export async function updateActividad(id: string, updates: Partial<Actividad>) {
  const { data, error } = await supabase
    .from('actividades')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Actividad
}

export async function deleteActividad(id: string) {
  const { error } = await supabase.from('actividades').delete().eq('id', id)
  if (error) throw error
}

export async function getCalificaciones(actividadId: string) {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('*')
    .eq('actividad_id', actividadId)
  if (error) throw error
  return data as Calificacion[]
}

export async function upsertCalificacion(calificacion: Partial<Calificacion>) {
  const { data, error } = await supabase
    .from('calificaciones')
    .upsert(calificacion, { onConflict: 'actividad_id,alumno_id' })
    .select()
    .single()
  if (error) throw error
  return data as Calificacion
}

export async function upsertCalificaciones(calificaciones: Partial<Calificacion>[]) {
  const { data, error } = await supabase
    .from('calificaciones')
    .upsert(calificaciones, { onConflict: 'actividad_id,alumno_id' })
    .select()
  if (error) throw error
  return data as Calificacion[]
}

export async function getInformes(alumnoId: string, materiaId: string, periodo: number) {
  const { data, error } = await supabase
    .from('informes_cualitativos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .eq('materia_id', materiaId)
    .eq('periodo', periodo)
  if (error) throw error
  return data as InformeCualitativo[]
}

export async function upsertInforme(informe: Partial<InformeCualitativo>) {
  const { data, error } = await supabase
    .from('informes_cualitativos')
    .upsert(informe, { onConflict: 'alumno_id,materia_id,periodo' })
    .select()
    .single()
  if (error) throw error
  return data as InformeCualitativo
}

export async function getConfiguracionAcademica(colegioId: string) {
  const { data, error } = await supabase
    .from('configuracion_academica')
    .select('*')
    .eq('colegio_id', colegioId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}
