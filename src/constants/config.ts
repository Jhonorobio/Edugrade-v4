export const Config = {
  appName: 'EduGrade',
  appVersion: '1.0.0',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  defaultGradeScale: { min: 1, max: 5, step: 0.1 },
  defaultPeriods: 3,
  defaultCategoryWeights: {
    apuntes_tareas: 25,
    talleres_exposiciones: 30,
    actitudinal: 15,
    evaluacion: 30,
  },
  defaultPeriodWeights: {
    period_1: 30,
    period_2: 30,
    period_3: 40,
  },
  performanceLevels: [
    { label: 'Bajo', min: 1, max: 2.9, color: '#F44336' },
    { label: 'Básico', min: 3, max: 3.9, color: '#FF9800' },
    { label: 'Alto', min: 4, max: 4.4, color: '#FFC107' },
    { label: 'Superior', min: 4.5, max: 5, color: '#4CAF50' },
  ],
  gradeCategories: [
    { id: 'apuntes_tareas', label: 'Apuntes y Tareas' },
    { id: 'talleres_exposiciones', label: 'Talleres y Exposiciones' },
    { id: 'actitudinal', label: 'Actitudinal' },
    { id: 'evaluacion', label: 'Evaluación' },
  ],
} as const
