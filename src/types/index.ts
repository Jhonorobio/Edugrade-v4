export type UserRole = 'SUPER_ADMIN' | 'ADMIN_COLEGIO' | 'DOCENTE'
export type UserStatus = 'activo' | 'inactivo' | 'suspendido'
export type StudentStatus = 'activo' | 'inactivo' | 'retirado'
export type Gender = 'masculino' | 'femenino' | 'otro'
export type ReportStatus = 'borrador' | 'enviado'
export type GradeLevel = 'Preescolar' | 'Primaria' | 'Bachillerato'

export interface Usuario {
  id: string
  nombre: string
  email: string
  username: string
  rol: UserRole
  genero: Gender | null
  estado: UserStatus
  created_at: string
  updated_at: string
}

export interface Colegio {
  id: string
  nombre: string
  codigo: string
  direccion: string | null
  telefono: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface UsuarioColegio {
  id: string
  usuario_id: string
  colegio_id: string
  rol: UserRole
  created_at: string
}

export interface Alumno {
  id: string
  nombre: string
  apellido: string
  colegio_id: string
  grado_id: string
  estado: StudentStatus
  created_at: string
  updated_at: string
}

export interface Grado {
  id: string
  nombre: string
  nivel: GradeLevel
  director_grupo_id: string | null
  colegio_id: string
  created_at: string
}

export interface Materia {
  id: string
  nombre: string
  codigo: string
  niveles: GradeLevel[]
  created_at: string
}

export interface AsignacionDocente {
  id: string
  usuario_id: string
  materia_id: string
  grado_id: string
  colegio_id: string
  created_at: string
}

export interface Actividad {
  id: string
  nombre: string
  categoria: CategoryType
  materia_id: string
  grado_id: string
  periodo: number
  colegio_id: string
  created_at: string
}

export type CategoryType = 'apuntes_tareas' | 'talleres_exposiciones' | 'actitudinal' | 'evaluacion'

export interface Calificacion {
  id: string
  actividad_id: string
  alumno_id: string
  nota: number | null
  created_at: string
  updated_at: string
}

export interface InformeCualitativo {
  id: string
  alumno_id: string
  materia_id: string
  grado_id: string
  periodo: number
  estado: ReportStatus
  actividades_no_entregadas: string | null
  actividades_insuficientes: string | null
  aspectos_positivos: string | null
  problemas_conducta: boolean
  problemas_asistencia: boolean
  presentacion_personal: string | null
  observaciones: string | null
  docente_id: string
  created_at: string
  updated_at: string
}

export interface ConfiguracionAcademica {
  id: string
  colegio_id: string
  escala_min: number
  escala_max: number
  periodos: number
  pesos_periodos: Record<string, number>
  pesos_categorias: Record<string, number>
  niveles_desempeno: NivelDesempeno[]
  created_at: string
  updated_at: string
}

export interface NivelDesempeno {
  label: string
  min: number
  max: number
  color: string
}

export interface PeriodoPeso {
  periodo: number
  peso: number
}

export interface CategoriaPeso {
  categoria: CategoryType
  peso: number
}
