import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, Chip, RadioButton } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '../../src/contexts/ThemeContext'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getUsuarios } from '../../src/services/auth'
import { getGrados, getMaterias } from '../../src/services/grades'
import { getAsignaciones, createAsignacion, deleteAsignacion } from '../../src/services/assignments'
import type { Usuario, Grado, Materia } from '../../src/types'
import { Spacing, Colors, BorderRadius } from '../../src/constants/theme'

export default function AssignmentsScreen() {
  const { theme } = useTheme()
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
    if (!form.usuario_id || !form.materia_id || !form.grado_id || !colegioActivo) return
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Asignaciones Docentes
        </Text>

        <ScrollView style={styles.list}>
          {asignaciones.map((a) => (
            <Card key={a.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Ionicons name="briefcase" size={24} color={Colors.primary} />
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium">{a.usuarios?.nombre || 'Docente'}</Text>
                    <Text variant="bodySmall" style={{ color: Colors.textSecondary }}>
                      {a.materias?.nombre} - {a.grados?.nombre}
                    </Text>
                  </View>
                  <Button icon="delete" compact onPress={() => handleDelete(a.id)} textColor={Colors.error}> </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <FAB icon="plus" style={[styles.fab, { backgroundColor: Colors.primary }]} onPress={() => setDialogOpen(true)} />
      </SafeAreaView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Nueva Asignación</Dialog.Title>
          <Dialog.Content>
            <Text variant="labelMedium" style={styles.label}>Docente</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {docentes.map((d) => (
                <Chip key={d.id} selected={form.usuario_id === d.id} onPress={() => setForm({...form, usuario_id: d.id})} style={styles.chip}>
                  {d.nombre}
                </Chip>
              ))}
            </ScrollView>

            <Text variant="labelMedium" style={styles.label}>Materia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {materias.map((m) => (
                <Chip key={m.id} selected={form.materia_id === m.id} onPress={() => setForm({...form, materia_id: m.id})} style={styles.chip}>
                  {m.nombre}
                </Chip>
              ))}
            </ScrollView>

            <Text variant="labelMedium" style={styles.label}>Grado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {grados.map((g) => (
                <Chip key={g.id} selected={form.grado_id === g.id} onPress={() => setForm({...form, grado_id: g.id})} style={styles.chip}>
                  {g.nombre}
                </Chip>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onPress={handleCreate}>Asignar</Button>
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
  list: { flex: 1 },
  card: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardInfo: { flex: 1 },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg },
  label: { marginTop: Spacing.md, marginBottom: Spacing.xs },
  chipRow: { marginBottom: Spacing.sm },
  chip: { marginRight: Spacing.xs },
})
