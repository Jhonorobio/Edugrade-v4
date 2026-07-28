import { supabase } from './supabase'
import type { Colegio } from '../types'

export async function getColegios() {
  const { data, error } = await supabase.from('colegios').select('*')
  if (error) throw error
  return data as Colegio[]
}

export async function getColegio(id: string) {
  const { data, error } = await supabase.from('colegios').select('*').eq('id', id).single()
  if (error) throw error
  return data as Colegio
}

export async function createColegio(colegio: Partial<Colegio>) {
  const { data, error } = await supabase.from('colegios').insert(colegio).select().single()
  if (error) throw error
  return data as Colegio
}

export async function updateColegio(id: string, updates: Partial<Colegio>) {
  const { data, error } = await supabase
    .from('colegios')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Colegio
}

export async function deleteColegio(id: string) {
  const { error } = await supabase.from('colegios').delete().eq('id', id)
  if (error) throw error
}

export async function getUsuarioColegios(usuarioId: string) {
  const { data, error } = await supabase
    .from('usuarios_colegios')
    .select('*, colegios(*)')
    .eq('usuario_id', usuarioId)
  if (error) throw error
  return data
}
