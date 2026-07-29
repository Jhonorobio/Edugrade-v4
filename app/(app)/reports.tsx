import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native'
import { Text, TextInput, Switch, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getAlumnos } from '../../src/services/students'
import { getGrados, getMaterias } from '../../src/services/grades'
import { getInformes, upsertInforme } from '../../src/services/grading'
import type { Alumno, Grado, Materia, InformeCualitativo, ReportStatus } from '../../src/types'

export default function ReportsScreen() {
  const { colegioActivo } = useSchool()
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [grados, setGrados] = useState<Grado[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [gradoId, setGradoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [periodo, setPeriodo] = useState(1)
  const [alumnoId, setAlumnoId] = useState('')
  const [informe, setInforme] = useState<InformeCualitativo | null>(null)

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
        docente_id: '',
      })
      loadInforme()
      Alert.alert('Éxito', enviar ? 'Informe enviado' : 'Informe guardado')
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  const selectedAlumno = alumnos.find(a => a.id === alumnoId)

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.screenTitle}>Informes Cualitativos</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {grados.map(g => (
            <Pressable key={g.id} onPress={() => setGradoId(g.id)} style={[styles.filterChip, gradoId === g.id && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, gradoId === g.id && styles.filterChipTextActive]}>{g.nombre}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {materias.map(m => (
            <Pressable key={m.id} onPress={() => setMateriaId(m.id)} style={[styles.filterChip, materiaId === m.id && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, materiaId === m.id && styles.filterChipTextActive]}>{m.nombre}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.periodRow}>
          {[1, 2, 3].map(p => (
            <Pressable key={p} onPress={() => setPeriodo(p)} style={[styles.periodBtn, periodo === p && styles.periodBtnActive]}>
              <Text style={[styles.periodText, periodo === p && styles.periodTextActive]}>P{p}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {alumnos.filter(a => !gradoId || a.grado_id === gradoId).map(a => (
            <Pressable key={a.id} onPress={() => { setAlumnoId(a.id); setTimeout(loadInforme, 0) }} style={[styles.filterChip, alumnoId === a.id && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, alumnoId === a.id && styles.filterChipTextActive]}>{a.nombre} {a.apellido}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {alumnoId && (
          <ScrollView style={styles.formScroll}>
            <Surface style={styles.formCard} elevation={0}>
              <View style={styles.formHeader}>
                <View style={styles.formHeaderLeft}>
                  <Ionicons name="document-text" size={20} color={Colors.primary} />
                  <Text style={styles.formTitle}>Informe: {selectedAlumno?.nombre} {selectedAlumno?.apellido}</Text>
                </View>
                {informe?.estado === 'enviado' && (
                  <View style={styles.enviadoBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.enviadoText}>Enviado</Text>
                  </View>
                )}
              </View>

              <Text style={styles.fieldLabel}>Actividades no entregadas</Text>
              <TextInput label="Actividades no entregadas" value={form.actividades_no_entregadas} onChangeText={(v) => setForm({...form, actividades_no_entregadas: v})} mode="outlined" multiline style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

              <Text style={styles.fieldLabel}>Actividades insuficientes</Text>
              <TextInput label="Actividades insuficientes" value={form.actividades_insuficientes} onChangeText={(v) => setForm({...form, actividades_insuficientes: v})} mode="outlined" multiline style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

              <Text style={styles.fieldLabel}>Aspectos positivos</Text>
              <TextInput label="Aspectos positivos" value={form.aspectos_positivos} onChangeText={(v) => setForm({...form, aspectos_positivos: v})} mode="outlined" multiline style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Ionicons name="warning" size={18} color={Colors.secondary} />
                  <Text style={styles.switchLabel}>Problemas de conducta</Text>
                </View>
                <Switch value={form.problemas_conducta} onValueChange={(v) => setForm({...form, problemas_conducta: v})} />
              </View>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Ionicons name="calendar" size={18} color={Colors.accent} />
                  <Text style={styles.switchLabel}>Problemas de asistencia</Text>
                </View>
                <Switch value={form.problemas_asistencia} onValueChange={(v) => setForm({...form, problemas_asistencia: v})} />
              </View>

              <Text style={styles.fieldLabel}>Presentación personal</Text>
              <TextInput label="Presentación personal" value={form.presentacion_personal} onChangeText={(v) => setForm({...form, presentacion_personal: v})} mode="outlined" multiline style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

              <Text style={styles.fieldLabel}>Observaciones</Text>
              <TextInput label="Observaciones" value={form.observaciones} onChangeText={(v) => setForm({...form, observaciones: v})} mode="outlined" multiline style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

              <View style={styles.actions}>
                <Pressable onPress={() => handleSave(false)} style={styles.btnSecondary}>
                  <Text style={styles.btnSecondaryText}>Guardar Borrador</Text>
                </Pressable>
                <Pressable onPress={() => handleSave(true)} style={[styles.btnPrimary, informe?.estado === 'enviado' && styles.btnDisabled]}>
                  <Ionicons name="send" size={16} color={Colors.textLight} />
                  <Text style={styles.btnPrimaryText}>Enviar</Text>
                </Pressable>
              </View>
            </Surface>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, padding: Spacing.xl },
  screenTitle: { fontSize: FontSizes.h1, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.lg },
  filterRow: { marginBottom: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm, ...Shadows.sm },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.text },
  filterChipTextActive: { color: Colors.textLight },
  periodRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  periodBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', ...Shadows.sm },
  periodBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText: { fontSize: FontSizes.sm, fontFamily: Fonts.semiBold, color: Colors.textSecondary },
  periodTextActive: { color: Colors.textLight },
  formScroll: { flex: 1 },
  formCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, ...Shadows.sm },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  formHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  formTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.semiBold, color: Colors.text },
  enviadoBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.success + '15', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  enviadoText: { fontSize: FontSizes.xs, fontFamily: Fonts.medium, color: Colors.success },
  fieldLabel: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input: { marginBottom: Spacing.sm, backgroundColor: Colors.surface },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  switchInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  switchLabel: { fontSize: FontSizes.md, fontFamily: Fonts.medium, color: Colors.text },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  btnSecondary: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  btnSecondaryText: { fontSize: FontSizes.md, fontFamily: Fonts.medium, color: Colors.text },
  btnPrimary: { flex: 1, flexDirection: 'row', paddingVertical: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  btnPrimaryText: { fontSize: FontSizes.md, fontFamily: Fonts.semiBold, color: Colors.textLight },
  btnDisabled: { opacity: 0.5 },
})
