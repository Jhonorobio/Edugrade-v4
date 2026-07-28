import { useState, useCallback, useRef } from 'react'
import { View, StyleSheet, ScrollView, Alert, TextInput as RNTextInput } from 'react-native'
import { Text, Card, Button, Dialog, Portal, TextInput, Searchbar, Chip, SegmentedButtons, Menu, Divider, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '../../src/contexts/ThemeContext'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getAlumnos } from '../../src/services/students'
import { getGrados, getMaterias } from '../../src/services/grades'
import { getActividades, createActividad, updateActividad, deleteActividad, getCalificaciones as getCalifs, upsertCalificaciones } from '../../src/services/grading'
import { calcularPromedioPeriodo, formatNota } from '../../src/utils/grading'
import type { Alumno, Grado, Materia, Actividad, CategoryType } from '../../src/types'
import { Spacing, Colors, BorderRadius } from '../../src/constants/theme'
import { Config } from '../../src/constants/config'

export default function GradingScreen() {
  const { theme } = useTheme()
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

  async function handleGradoChange(id: string) {
    setGradoId(id)
    if (materiaId) setTimeout(loadActividades, 0)
  }

  async function handleMateriaChange(id: string) {
    setMateriaId(id)
    if (gradoId) setTimeout(loadActividades, 0)
  }

  async function handlePeriodoChange(p: number) {
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Planilla de Calificaciones
        </Text>

        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {grados.map(g => (
              <Chip key={g.id} selected={gradoId === g.id} onPress={() => handleGradoChange(g.id)} style={styles.filterChip}>
                {g.nombre}
              </Chip>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {materias.map(m => (
              <Chip key={m.id} selected={materiaId === m.id} onPress={() => handleMateriaChange(m.id)} style={styles.filterChip}>
                {m.nombre}
              </Chip>
            ))}
          </ScrollView>

          <SegmentedButtons
            value={periodo.toString()}
            onValueChange={(v) => handlePeriodoChange(parseInt(v))}
            buttons={[1, 2, 3].map(p => ({ value: p.toString(), label: `P${p}` }))}
            style={styles.periodSelector}
          />
        </View>

        {(materiaId && gradoId) ? (
          <ScrollView style={styles.gradebook}>
            <Surface style={styles.table}>
              <ScrollView horizontal>
                <View>
                  <View style={[styles.tableHeader, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text style={[styles.headerCell, styles.nameCol, { color: theme.colors.onPrimaryContainer }]}>Estudiante</Text>
                    {actividades.map((act, i) => (
                      <View key={act.id} style={styles.headerCellWithActions}>
                        <Text
                          style={[styles.headerCell, styles.gradeCol, { color: theme.colors.onPrimaryContainer }]}
                          numberOfLines={2}
                        >
                          {act.nombre}
                        </Text>
                        <Text style={[styles.catLabel, { color: theme.colors.onPrimaryContainer }]}>
                          {categoriaLabel(act.categoria)}
                        </Text>
                      </View>
                    ))}
                    <Text style={[styles.headerCell, styles.avgCol, { color: theme.colors.onPrimaryContainer }]}>Prom.</Text>
                    <View style={styles.headerActions}>
                      <Button compact icon="plus" onPress={() => openActDialog()} style={styles.addActBtn}>
                        Act.
                      </Button>
                    </View>
                  </View>

                  {alumnos.map((alumno) => {
                    const prom = getPromedio(alumno.id)
                    return (
                      <View key={alumno.id} style={[styles.tableRow, { borderBottomColor: theme.colors.outlineVariant }]}>
                        <Text style={[styles.rowCell, styles.nameCol]} numberOfLines={1}>
                          {alumno.nombre} {alumno.apellido}
                        </Text>
                        {actividades.map((act) => {
                          const cellKey = `${alumno.id}-${act.id}`
                          return (
                            <RNTextInput
                              key={cellKey}
                              ref={ref => { inputRefs.current[cellKey] = ref }}
                              style={[styles.gradeInput, { borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
                              value={calificaciones[act.id]?.[alumno.id]?.toString() || ''}
                              onChangeText={(v) => handleNotaChange(alumno.id, act.id, v)}
                              keyboardType="decimal-pad"
                              maxLength={4}
                            />
                          )
                        })}
                        <Text style={[styles.rowCell, styles.avgCol, { fontWeight: 'bold' }]}>
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
            <Text variant="bodyLarge" style={{ color: Colors.textSecondary, marginTop: Spacing.md }}>
              Seleccione un grado y materia para comenzar
            </Text>
          </View>
        )}
      </SafeAreaView>

      <Portal>
        <Dialog visible={actDialogOpen} onDismiss={() => setActDialogOpen(false)}>
          <Dialog.Title>{editingAct ? 'Editar Actividad' : 'Nueva Actividad'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={newActNombre} onChangeText={setNewActNombre} mode="outlined" style={styles.input} />
            <Text variant="labelMedium" style={styles.catTitle}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Config.gradeCategories.map(cat => (
                <Chip
                  key={cat.id}
                  selected={newActCategoria === cat.id}
                  onPress={() => setNewActCategoria(cat.id as CategoryType)}
                  style={styles.catChip}
                >
                  {cat.label}
                </Chip>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            {editingAct && <Button onPress={() => handleDeleteActividad(editingAct.id)} textColor={Colors.error}>Eliminar</Button>}
            <Button onPress={() => setActDialogOpen(false)}>Cancelar</Button>
            <Button onPress={handleSaveActividad}>{editingAct ? 'Guardar' : 'Crear'}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg },
  title: { marginBottom: Spacing.md, fontWeight: 'bold' },
  filters: { marginBottom: Spacing.md },
  filterRow: { marginBottom: Spacing.sm },
  filterChip: { marginRight: Spacing.sm },
  periodSelector: { marginBottom: Spacing.sm },
  gradebook: { flex: 1 },
  table: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerCellWithActions: {
    width: 100,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  catLabel: { fontSize: 9, marginTop: 2 },
  nameCol: { width: 150, paddingHorizontal: Spacing.sm },
  gradeCol: { width: 100 },
  avgCol: { width: 60, textAlign: 'center' },
  headerActions: { paddingLeft: Spacing.xs },
  addActBtn: { height: 32 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
  },
  rowCell: {
    fontSize: 13,
    paddingVertical: Spacing.xs,
  },
  gradeInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 13,
    textAlign: 'center',
    marginHorizontal: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: { marginBottom: Spacing.sm },
  catTitle: { marginBottom: Spacing.sm, marginTop: Spacing.sm },
  catChip: { marginRight: Spacing.sm },
})
