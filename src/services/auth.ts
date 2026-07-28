import { supabase } from './supabase'
import type { Usuario } from '../types'

export async function loginWithUsername(username: string, password: string) {
  const email = `${username}@edugrade.local`
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (authError) throw authError

  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('username', username)
    .single()

  if (userError) throw userError
  if (usuario.estado !== 'activo') throw new Error('Usuario inactivo o suspendido')

  return { auth: authData, usuario: usuario as Usuario }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<Usuario | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Usuario | null
}

export async function getUsuarios(colegioId?: string) {
  let query = supabase.from('usuarios').select('*')
  if (colegioId) {
    query = query.eq('colegio_id', colegioId)
  }
  const { data, error } = await query
  if (error) throw error
  return data as Usuario[]
}

export async function createUsuario(usuario: Partial<Usuario> & { password: string }) {
  const email = `${usuario.username}@edugrade.local`
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: usuario.password,
  })
  if (authError) throw authError
  if (!authData.user) throw new Error('Error creating auth user')

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      id: authData.user.id,
      nombre: usuario.nombre,
      email,
      username: usuario.username,
      rol: usuario.rol,
      genero: usuario.genero,
      estado: 'activo',
    })
    .select()
    .single()

  if (error) throw error
  return data as Usuario
}

export async function updateUsuario(id: string, updates: Partial<Usuario>) {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Usuario
}

export async function deleteUsuario(id: string) {
  const { error } = await supabase.from('usuarios').delete().eq('id', id)
  if (error) throw error
}

export async function assignUserToSchool(usuarioId: string, colegioId: string, rol: string) {
  const { data, error } = await supabase
    .from('usuarios_colegios')
    .insert({ usuario_id: usuarioId, colegio_id: colegioId, rol })
    .select()
    .single()

  if (error) throw error
  return data
}
