import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, Chip, Switch, SegmentedButtons, RadioButton } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '../../src/contexts/ThemeContext'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getAlumnos } from '../../src/services/students'
import { getGrados, getMaterias } from '../../src/services/grades'
import { getInformes, upsertInforme } from '../../src/services/grading'
import type { Alumno, Grado, Materia, InformeCualitativo, ReportStatus } from '../../src/types'
import { Spacing, Colors, BorderRadius } from '../../src/constants/theme'

export default function ReportsScreen() {
  const { theme } = useTheme()
  const { colegioActivo } = useSchool()
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [grados, setGrados] = useState<Grado[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [gradoId, setGradoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [periodo, setPeriodo] = useState(1)
  const [alumnoId, setAlumnoId] = useState('')
  const [informe, setInforme] = useState<InformeCualitativo | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState({
    actividades_no_entregadas: '',
    actividades_insuficientes: '',
    aspectos_positivos: '',
    problemas_conducta: false,
    problemas_asistencia: false,
    presentacion_personal: '',
    observaciones: '',
    estado: 'borrador' as ReportStatus,
  })

  useFocusEffect(useCallback(() => {
    if (colegioActivo) loadInit()
  }, [colegioActivo]))

  async function loadInit() {
    if (!colegioActivo) return
    try {
      const [g, m, a] = await Promise.all([
        getGrados(colegioActivo.id),
        getMaterias(),
        getAlumnos(colegioActivo.id),
      ])
      setGrados(g)
      setMaterias(m)
      setAlumnos(a)
    } catch (e) { console.error(e) }
  }

  async function loadInforme() {
    if (!alumnoId || !materiaId) return
    try {
      const informes = await getInformes(alumnoId, materiaId, periodo)
      const found = informes[0] || null
      setInforme(found)
      if (found) {
        setForm({
          actividades_no_entregadas: found.actividades_no_entregadas || '',
          actividades_insuficientes: found.actividades_insuficientes || '',
          aspectos_positivos: found.aspectos_positivos || '',
          problemas_conducta: found.problemas_conducta,
          problemas_asistencia: found.problemas_asistencia,
          presentacion_personal: found.presentacion_personal || '',
          observaciones: found.observaciones || '',
          estado: found.estado,
        })
      } else {
        setForm({
          actividades_no_entregadas: '',
          actividades_insuficientes: '',
          aspectos_positivos: '',
          problemas_conducta: false,
          problemas_asistencia: false,
          presentacion_personal: '',
          observaciones: '',
          estado: 'borrador',
        })
      }
    } catch (e) { console.error(e) }
  }

  async function handleSave(enviar = false) {
    if (!alumnoId || !materiaId || !colegioActivo || !gradoId) return
    try {
      await upsertInforme({
        alumno_id: alumnoId,
        materia_id: materiaId,
        grado_id: gradoId,
        periodo,
        ...form,
        estado: enviar ? 'enviado' : 'borrador',
        docente_id: '', // will be set by RLS
      })
      loadInforme()
      Alert.alert('Éxito', enviar ? 'Informe enviado' : 'Informe guardado')
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  const selectedAlumno = alumnos.find(a => a.id === alumnoId)

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Informes Cualitativos
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {grados.map(g => (
            <Chip key={g.id} selected={gradoId === g.id} onPress={() => setGradoId(g.id)} style={styles.filterChip}>{g.nombre}</Chip>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {materias.map(m => (
            <Chip key={m.id} selected={materiaId === m.id} onPress={() => setMateriaId(m.id)} style={styles.filterChip}>{m.nombre}</Chip>
          ))}
        </ScrollView>
        <SegmentedButtons
          value={periodo.toString()}
          onValueChange={(v) => setPeriodo(parseInt(v))}
          buttons={[1, 2, 3].map(p => ({ value: p.toString(), label: `Período ${p}` }))}
          style={styles.periodSelector}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {alumnos.filter(a => !gradoId || a.grado_id === gradoId).map(a => (
            <Chip key={a.id} selected={alumnoId === a.id} onPress={() => { setAlumnoId(a.id); setTimeout(loadInforme, 0) }} style={styles.filterChip}>
              {a.nombre} {a.apellido}
            </Chip>
          ))}
        </ScrollView>

        {alumnoId && (
          <ScrollView style={styles.form}>
            <Card style={styles.formCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.formTitle}>
                  Informe: {selectedAlumno?.nombre} {selectedAlumno?.apellido}
                </Text>
                {informe?.estado === 'enviado' && (
                  <Chip icon="check" style={styles.enviadoChip}>Enviado</Chip>
                )}

                <TextInput label="Actividades no entregadas" value={form.actividades_no_entregadas} onChangeText={(v) => setForm({...form, actividades_no_entregadas: v})} mode="outlined" multiline style={styles.input} />
                <TextInput label="Actividades insuficientes" value={form.actividades_insuficientes} onChangeText={(v) => setForm({...form, actividades_insuficientes: v})} mode="outlined" multiline style={styles.input} />
                <TextInput label="Aspectos positivos" value={form.aspectos_positivos} onChangeText={(v) => setForm({...form, aspectos_positivos: v})} mode="outlined" multiline style={styles.input} />

                <View style={styles.switchRow}>
                  <Text variant="bodyMedium">Problemas de conducta</Text>
                  <Switch value={form.problemas_conducta} onValueChange={(v) => setForm({...form, problemas_conducta: v})} />
                </View>
                <View style={styles.switchRow}>
                  <Text variant="bodyMedium">Problemas de asistencia</Text>
                  <Switch value={form.problemas_asistencia} onValueChange={(v) => setForm({...form, problemas_asistencia: v})} />
                </View>

                <TextInput label="Presentación personal" value={form.presentacion_personal} onChangeText={(v) => setForm({...form, presentacion_personal: v})} mode="outlined" multiline style={styles.input} />
                <TextInput label="Observaciones" value={form.observaciones} onChangeText={(v) => setForm({...form, observaciones: v})} mode="outlined" multiline style={styles.input} />

                <View style={styles.actions}>
                  <Button mode="outlined" onPress={() => handleSave(false)}>Guardar Borrador</Button>
                  <Button mode="contained" onPress={() => handleSave(true)} disabled={informe?.estado === 'enviado'}>
                    Enviar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg },
  title: { marginBottom: Spacing.md, fontWeight: 'bold' },
  filterRow: { marginBottom: Spacing.sm },
  filterChip: { marginRight: Spacing.sm },
  periodSelector: { marginBottom: Spacing.md },
  form: { flex: 1 },
  formCard: { marginTop: Spacing.md },
  formTitle: { marginBottom: Spacing.md, fontWeight: '600' },
  enviadoChip: { alignSelf: 'flex-start', marginBottom: Spacing.md, backgroundColor: Colors.statusActive + '20' },
  input: { marginBottom: Spacing.sm },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
})
