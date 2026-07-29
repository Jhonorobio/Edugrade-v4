import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native'
import { Text, TextInput, Dialog, Portal, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getUsuarios } from '../../src/services/auth'
import { getGrados, getMaterias } from '../../src/services/grades'
import { getAsignaciones, createAsignacion, deleteAsignacion } from '../../src/services/assignments'
import type { Usuario, Grado, Materia } from '../../src/types'

export default function AssignmentsScreen() {
  const { colegioActivo } = useSchool()
  const [docentes, setDocentes] = useState<Usuario[]>([])
  const [grados, setGrados] = useState<Grado[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [asignaciones, setAsignaciones] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ usuario_id: '', materia_id: '', grado_id: '' })

  useFocusEffect(useCallback(() => { if (colegioActivo) loadData() }, [colegioActivo]))

  async function loadData() {
    if (!colegioActivo) return
    try {
      const [users, g, m, a] = await Promise.all([
        getUsuarios(colegioActivo.id),
        getGrados(colegioActivo.id),
        getMaterias(),
        getAsignaciones(colegioActivo.id),
      ])
      setDocentes(users.filter(u => u.rol === 'DOCENTE'))
      setGrados(g)
      setMaterias(m)
      setAsignaciones(a)
    } catch (e) { console.error(e) }
  }

  async function handleCreate() {
    if (!form.usuario_id || !form.materia_id || !form.grado_id || !colegioActivo) {
      Alert.alert('Error', 'Seleccione docente, materia y grado')
      return
    }
    try {
      await createAsignacion({ ...form, colegio_id: colegioActivo.id })
      setDialogOpen(false)
      setForm({ usuario_id: '', materia_id: '', grado_id: '' })
      loadData()
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  async function handleDelete(id: string) {
    Alert.alert('Eliminar asignación', '¿Está seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteAsignacion(id); loadData() }
        catch (e: any) { Alert.alert('Error', e.message) }
      }},
    ])
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.screenTitle}>Asignaciones Docentes</Text>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {asignaciones.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={48} color={Colors.disabled} />
              <Text style={styles.emptyText}>No hay asignaciones</Text>
            </View>
          )}
          {asignaciones.map((a) => (
            <Surface key={a.id} style={styles.card} elevation={0}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBadge, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name="briefcase" size={22} color={Colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{a.usuarios?.nombre || 'Docente'}</Text>
                  <Text style={styles.cardSubtitle}>
                    {a.materias?.nombre} — {a.grados?.nombre}
                  </Text>
                </View>
                <Pressable onPress={() => handleDelete(a.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.secondary} />
                </Pressable>
              </View>
            </Surface>
          ))}
        </ScrollView>

        <Pressable style={styles.fab} onPress={() => setDialogOpen(true)}>
          <Ionicons name="add" size={28} color={Colors.textLight} />
        </Pressable>
      </SafeAreaView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)} style={styles.dialog}>
          <Text style={styles.dialogTitle}>Nueva Asignación</Text>
          <Dialog.Content>
            <Text style={styles.label}>Docente</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {docentes.map((d) => (
                <Pressable key={d.id} onPress={() => setForm({...form, usuario_id: d.id})} style={[styles.chip, form.usuario_id === d.id && styles.chipActive]}>
                  <Text style={[styles.chipText, form.usuario_id === d.id && styles.chipTextActive]}>{d.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Materia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {materias.map((m) => (
                <Pressable key={m.id} onPress={() => setForm({...form, materia_id: m.id})} style={[styles.chip, form.materia_id === m.id && styles.chipActive]}>
                  <Text style={[styles.chipText, form.materia_id === m.id && styles.chipTextActive]}>{m.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Grado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {grados.map((g) => (
                <Pressable key={g.id} onPress={() => setForm({...form, grado_id: g.id})} style={[styles.chip, form.grado_id === g.id && styles.chipActive]}>
                  <Text style={[styles.chipText, form.grado_id === g.id && styles.chipTextActive]}>{g.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Pressable onPress={() => setDialogOpen(false)} style={styles.dialogBtn}>
              <Text style={styles.dialogBtnCancel}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleCreate} style={[styles.dialogBtn, styles.dialogBtnPrimary]}>
              <Text style={styles.dialogBtnText}>Asignar</Text>
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
  screenTitle: { fontSize: FontSizes.h1, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.xl },
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: Spacing.xxxl * 2 },
  emptyText: { fontSize: FontSizes.md, fontFamily: Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.md },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  cardTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.semiBold, color: Colors.text },
  cardSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.secondary + '10', justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', right: Spacing.xl, bottom: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  dialog: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg },
  dialogTitle: { fontSize: FontSizes.xl, fontFamily: Fonts.bold, color: Colors.text, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  label: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.md, marginBottom: Spacing.xs },
  chipScroll: { marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: Colors.surfaceVariant, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.text },
  chipTextActive: { color: Colors.textLight },
  dialogBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  dialogBtnPrimary: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md },
  dialogBtnText: { color: Colors.textLight, fontFamily: Fonts.medium },
  dialogBtnCancel: { color: Colors.textSecondary, fontFamily: Fonts.medium },
})
