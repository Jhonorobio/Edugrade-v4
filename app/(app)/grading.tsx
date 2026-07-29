import { useState, useCallback, useRef } from 'react'
import { View, StyleSheet, ScrollView, Alert, TextInput as RNTextInput, Pressable } from 'react-native'
import { Text, TextInput, Dialog, Portal, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getAlumnos } from '../../src/services/students'
import { getGrados, getMaterias } from '../../src/services/grades'
import { getActividades, createActividad, updateActividad, deleteActividad, getCalificaciones as getCalifs, upsertCalificaciones } from '../../src/services/grading'
import { calcularPromedioPeriodo, formatNota } from '../../src/utils/grading'
import type { Alumno, Grado, Materia, Actividad, CategoryType } from '../../src/types'
import { Config } from '../../src/constants/config'

export default function GradingScreen() {
  const { colegioActivo } = useSchool()

  const [grados, setGrados] = useState<Grado[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [calificaciones, setCalificaciones] = useState<Record<string, Record<string, number | null>>>({})
  const [loading, setLoading] = useState(true)

  const [gradoId, setGradoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [periodo, setPeriodo] = useState(1)

  const [actDialogOpen, setActDialogOpen] = useState(false)
  const [newActNombre, setNewActNombre] = useState('')
  const [newActCategoria, setNewActCategoria] = useState<CategoryType>('apuntes_tareas')
  const [editingAct, setEditingAct] = useState<Actividad | null>(null)

  const inputRefs = useRef<Record<string, RNTextInput | null>>({})

  useFocusEffect(useCallback(() => {
    if (colegioActivo) loadInit()
  }, [colegioActivo]))

  async function loadInit() {
    if (!colegioActivo) return
    setLoading(true)
    try {
      const [gradosData, materiasData, alumnosData] = await Promise.all([
        getGrados(colegioActivo.id),
        getMaterias(),
        getAlumnos(colegioActivo.id),
      ])
      setGrados(gradosData)
      setMaterias(materiasData)
      setAlumnos(alumnosData)
      if (gradosData.length > 0 && !gradoId) setGradoId(gradosData[0].id)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadActividades() {
    if (!colegioActivo || !materiaId || !gradoId) return
    try {
      const data = await getActividades(materiaId, gradoId, periodo, colegioActivo.id)
      setActividades(data)

      const califsMap: Record<string, Record<string, number | null>> = {}
      for (const act of data) {
        const califs = await getCalifs(act.id)
        califsMap[act.id] = {}
        for (const c of califs || []) {
          califsMap[act.id][c.alumno_id] = c.nota
        }
      }
      setCalificaciones(califsMap)
    } catch (e) { console.error(e) }
  }

  function handleGradoChange(id: string) {
    setGradoId(id)
    if (materiaId) setTimeout(loadActividades, 0)
  }

  function handleMateriaChange(id: string) {
    setMateriaId(id)
    if (gradoId) setTimeout(loadActividades, 0)
  }

  function handlePeriodoChange(p: number) {
    setPeriodo(p)
    if (materiaId && gradoId) setTimeout(loadActividades, 100)
  }

  function openActDialog(act?: Actividad) {
    if (act) {
      setEditingAct(act)
      setNewActNombre(act.nombre)
      setNewActCategoria(act.categoria as CategoryType)
    } else {
      setEditingAct(null)
      setNewActNombre('')
      setNewActCategoria('apuntes_tareas')
    }
    setActDialogOpen(true)
  }

  async function handleSaveActividad() {
    if (!newActNombre || !colegioActivo || !materiaId || !gradoId) return
    try {
      if (editingAct) {
        await updateActividad(editingAct.id, { nombre: newActNombre, categoria: newActCategoria })
      } else {
        await createActividad({
          nombre: newActNombre,
          categoria: newActCategoria,
          materia_id: materiaId,
          grado_id: gradoId,
          periodo,
          colegio_id: colegioActivo.id,
        })
      }
      setActDialogOpen(false)
      loadActividades()
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  async function handleDeleteActividad(id: string) {
    Alert.alert('Eliminar actividad', '¿Está seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteActividad(id); loadActividades() }
        catch (e: any) { Alert.alert('Error', e.message) }
      }},
    ])
  }

  async function handleNotaChange(alumnoId: string, actividadId: string, nota: string) {
    const parsed = nota === '' ? null : parseFloat(nota)
    if (parsed !== null && (isNaN(parsed) || parsed < 0 || parsed > 5)) return

    setCalificaciones(prev => ({
      ...prev,
      [actividadId]: { ...prev[actividadId], [alumnoId]: parsed },
    }))

    try {
      await upsertCalificaciones([{ actividad_id: actividadId, alumno_id: alumnoId, nota: parsed }])
    } catch (e) { console.error(e) }
  }

  function getPromedio(alumnoId: string): number | null {
    const cats: Record<string, (number | null)[]> = {}
    for (const act of actividades) {
      const nota = calificaciones[act.id]?.[alumnoId] ?? null
      if (!cats[act.categoria]) cats[act.categoria] = []
      cats[act.categoria].push(nota)
    }
    return calcularPromedioPeriodo(cats, Config.defaultCategoryWeights)
  }

  const categoriaLabel = (cat: string) => {
    const found = Config.gradeCategories.find(c => c.id === cat)
    return found ? found.label : cat
  }

  const catColor = (cat: string) => {
    if (cat === 'apuntes_tareas') return Colors.primary
    if (cat === 'pruebas_examen') return Colors.secondary
    if (cat === 'proyectos') return Colors.accent
    return Colors.success
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.screenTitle}>Planilla de Calificaciones</Text>

        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {grados.map(g => (
              <Pressable key={g.id} onPress={() => handleGradoChange(g.id)} style={[styles.filterChip, gradoId === g.id && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, gradoId === g.id && styles.filterChipTextActive]}>{g.nombre}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {materias.map(m => (
              <Pressable key={m.id} onPress={() => handleMateriaChange(m.id)} style={[styles.filterChip, materiaId === m.id && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, materiaId === m.id && styles.filterChipTextActive]}>{m.nombre}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.periodRow}>
            {[1, 2, 3].map(p => (
              <Pressable key={p} onPress={() => handlePeriodoChange(p)} style={[styles.periodBtn, periodo === p && styles.periodBtnActive]}>
                <Text style={[styles.periodText, periodo === p && styles.periodTextActive]}>P{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {(materiaId && gradoId) ? (
          <ScrollView style={styles.gradebook}>
            <Surface style={styles.table} elevation={0}>
              <ScrollView horizontal>
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.nameCol]}>Estudiante</Text>
                    {actividades.map((act) => (
                      <View key={act.id} style={styles.headerCellWrap}>
                        <Text style={[styles.headerCell, styles.gradeCol]} numberOfLines={2}>{act.nombre}</Text>
                        <View style={[styles.catBadge, { backgroundColor: catColor(act.categoria) + '15' }]}>
                          <Text style={[styles.catBadgeText, { color: catColor(act.categoria) }]}>{categoriaLabel(act.categoria)}</Text>
                        </View>
                      </View>
                    ))}
                    <Text style={[styles.headerCell, styles.avgCol]}>Prom.</Text>
                    <View style={styles.headerActions}>
                      <Pressable onPress={() => openActDialog()} style={styles.addActBtn}>
                        <Ionicons name="add" size={16} color={Colors.primary} />
                      </Pressable>
                    </View>
                  </View>

                  {alumnos.map((alumno) => {
                    const prom = getPromedio(alumno.id)
                    return (
                      <View key={alumno.id} style={styles.tableRow}>
                        <Text style={[styles.rowCell, styles.nameCol]} numberOfLines={1}>
                          {alumno.nombre} {alumno.apellido}
                        </Text>
                        {actividades.map((act) => {
                          const cellKey = `${alumno.id}-${act.id}`
                          return (
                            <RNTextInput
                              key={cellKey}
                              ref={ref => { inputRefs.current[cellKey] = ref }}
                              style={styles.gradeInput}
                              value={calificaciones[act.id]?.[alumno.id]?.toString() || ''}
                              onChangeText={(v) => handleNotaChange(alumno.id, act.id, v)}
                              keyboardType="decimal-pad"
                              maxLength={4}
                            />
                          )
                        })}
                        <Text style={[styles.rowCell, styles.avgCol, styles.avgText]}>
                          {formatNota(prom)}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </ScrollView>
            </Surface>
          </ScrollView>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={64} color={Colors.disabled} />
            <Text style={styles.emptyText}>Seleccione un grado y materia</Text>
          </View>
        )}
      </SafeAreaView>

      <Portal>
        <Dialog visible={actDialogOpen} onDismiss={() => setActDialogOpen(false)} style={styles.dialog}>
          <Text style={styles.dialogTitle}>{editingAct ? 'Editar' : 'Nueva'} Actividad</Text>
          <Dialog.Content>
            <TextInput label="Nombre" value={newActNombre} onChangeText={setNewActNombre} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <Text style={styles.label}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Config.gradeCategories.map(cat => (
                <Pressable key={cat.id} onPress={() => setNewActCategoria(cat.id as CategoryType)} style={[styles.catChip, newActCategoria === cat.id && { backgroundColor: catColor(cat.id), borderColor: catColor(cat.id) }]}>
                  <Text style={[styles.catChipText, newActCategoria === cat.id && { color: Colors.textLight }]}>{cat.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            {editingAct && (
              <Pressable onPress={() => handleDeleteActividad(editingAct.id)} style={styles.dialogBtn}>
                <Text style={{ color: Colors.secondary, fontFamily: Fonts.medium }}>Eliminar</Text>
              </Pressable>
            )}
            <Pressable onPress={() => setActDialogOpen(false)} style={styles.dialogBtn}>
              <Text style={styles.dialogBtnCancel}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleSaveActividad} style={[styles.dialogBtn, styles.dialogBtnPrimary]}>
              <Text style={styles.dialogBtnText}>{editingAct ? 'Guardar' : 'Crear'}</Text>
            </Pressable>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, padding: Spacing.xl },
  screenTitle: { fontSize: FontSizes.h1, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.lg },
  filters: { marginBottom: Spacing.md },
  filterRow: { marginBottom: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm, ...Shadows.sm },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.text },
  filterChipTextActive: { color: Colors.textLight },
  periodRow: { flexDirection: 'row', gap: Spacing.sm },
  periodBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', ...Shadows.sm },
  periodBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText: { fontSize: FontSizes.sm, fontFamily: Fonts.semiBold, color: Colors.textSecondary },
  periodTextActive: { color: Colors.textLight },
  gradebook: { flex: 1 },
  table: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.sm },
  tableHeader: { flexDirection: 'row', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, backgroundColor: Colors.primary + '08', alignItems: 'center' },
  headerCell: { fontSize: FontSizes.xs, fontFamily: Fonts.semiBold, color: Colors.text, textAlign: 'center' },
  headerCellWrap: { width: 100, alignItems: 'center', paddingHorizontal: 2 },
  catBadge: { paddingHorizontal: Spacing.xs, paddingVertical: 1, borderRadius: BorderRadius.sm, marginTop: 2 },
  catBadgeText: { fontSize: 8, fontFamily: Fonts.medium },
  nameCol: { width: 150, paddingHorizontal: Spacing.sm },
  gradeCol: { width: 100 },
  avgCol: { width: 60, textAlign: 'center' },
  headerActions: { paddingLeft: Spacing.xs },
  addActBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowCell: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.text, paddingVertical: Spacing.xs },
  gradeInput: { width: 80, height: 36, borderWidth: 1, borderRadius: BorderRadius.sm, borderColor: Colors.border, paddingHorizontal: Spacing.sm, fontSize: FontSizes.sm, textAlign: 'center', marginHorizontal: 2, backgroundColor: Colors.surface, fontFamily: Fonts.regular },
  avgText: { fontFamily: Fonts.bold, color: Colors.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: FontSizes.md, fontFamily: Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.md },
  dialog: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg },
  dialogTitle: { fontSize: FontSizes.xl, fontFamily: Fonts.bold, color: Colors.text, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  input: { marginBottom: Spacing.sm, backgroundColor: Colors.surface },
  label: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  catChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: Colors.surfaceVariant, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  catChipText: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.text },
  dialogBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  dialogBtnPrimary: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md },
  dialogBtnText: { color: Colors.textLight, fontFamily: Fonts.medium },
  dialogBtnCancel: { color: Colors.textSecondary, fontFamily: Fonts.medium },
})
