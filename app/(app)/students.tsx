import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, Searchbar, Chip } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '../../src/contexts/ThemeContext'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getAlumnos, createAlumno, updateAlumno, deleteAlumno } from '../../src/services/students'
import { getGrados } from '../../src/services/grades'
import type { Alumno, Grado } from '../../src/types'
import { Spacing, Colors, BorderRadius } from '../../src/constants/theme'

export default function StudentsScreen() {
  const { theme } = useTheme()
  const { colegioActivo } = useSchool()
  const [alumnos, setAlumnos] = useState<(Alumno & { grados?: { nombre: string } })[]>([])
  const [grados, setGrados] = useState<Grado[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gradoFilter, setGradoFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Alumno | null>(null)
  const [form, setForm] = useState({ nombre: '', apellido: '', grado_id: '' })

  useFocusEffect(useCallback(() => {
    if (colegioActivo) { loadData() }
  }, [colegioActivo]))

  async function loadData() {
    if (!colegioActivo) return
    setLoading(true)
    try {
      const [alumnosData, gradosData] = await Promise.all([
        getAlumnos(colegioActivo.id),
        getGrados(colegioActivo.id),
      ])
      setAlumnos(alumnosData)
      setGrados(gradosData)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', apellido: '', grado_id: grados[0]?.id || '' })
    setDialogOpen(true)
  }

  function openEdit(alumno: Alumno) {
    setEditing(alumno)
    setForm({ nombre: alumno.nombre, apellido: alumno.apellido, grado_id: alumno.grado_id })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nombre || !form.apellido || !colegioActivo) {
      Alert.alert('Error', 'Nombre, apellido y colegio son obligatorios')
      return
    }
    try {
      if (editing) {
        await updateAlumno(editing.id, form)
      } else {
        await createAlumno({ ...form, colegio_id: colegioActivo.id, estado: 'activo' })
      }
      setDialogOpen(false)
      loadData()
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  async function handleDelete(id: string) {
    Alert.alert('Confirmar', '¿Eliminar este alumno?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteAlumno(id); loadData() }
        catch (e: any) { Alert.alert('Error', e.message) }
      }},
    ])
  }

  const filtered = alumnos.filter(a => {
    const matchSearch = `${a.nombre} ${a.apellido}`.toLowerCase().includes(search.toLowerCase())
    const matchGrado = !gradoFilter || a.grado_id === gradoFilter
    return matchSearch && matchGrado
  })

  const gradoActual = (id: string) => grados.find(g => g.id === id)

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Alumnos
        </Text>

        <Searchbar placeholder="Buscar alumno..." value={search} onChangeText={setSearch} style={styles.search} />

        <ScrollView horizontal style={styles.filterRow} showsHorizontalScrollIndicator={false}>
          <Chip selected={!gradoFilter} onPress={() => setGradoFilter('')} style={styles.filterChip}>Todos</Chip>
          {grados.map((g) => (
            <Chip key={g.id} selected={gradoFilter === g.id} onPress={() => setGradoFilter(gradoFilter === g.id ? '' : g.id)} style={styles.filterChip}>
              {g.nombre}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView style={styles.list}>
          {filtered.map((alumno) => (
            <Card key={alumno.id} style={styles.card} onPress={() => openEdit(alumno)}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Ionicons name="person" size={28} color={Colors.secondary} />
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium">{alumno.nombre} {alumno.apellido}</Text>
                    <Text variant="bodySmall" style={{ color: Colors.textSecondary }}>
                      {gradoActual(alumno.grado_id)?.nombre || 'Sin grado'} | {alumno.estado}
                    </Text>
                  </View>
                  <Button icon="delete" compact onPress={() => handleDelete(alumno.id)} textColor={Colors.error}> </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <FAB icon="plus" style={[styles.fab, { backgroundColor: Colors.primary }]} onPress={openCreate} />
      </SafeAreaView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>{editing ? 'Editar Alumno' : 'Nuevo Alumno'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm({...form, nombre: v})} mode="outlined" style={styles.input} />
            <TextInput label="Apellido" value={form.apellido} onChangeText={(v) => setForm({...form, apellido: v})} mode="outlined" style={styles.input} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradePicker}>
              {grados.map((g) => (
                <Chip
                  key={g.id}
                  selected={form.grado_id === g.id}
                  onPress={() => setForm({...form, grado_id: g.id})}
                  style={styles.gradeChip}
                >
                  {g.nombre}
                </Chip>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onPress={handleSave}>{editing ? 'Guardar' : 'Crear'}</Button>
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
  search: { marginBottom: Spacing.sm },
  filterRow: { marginBottom: Spacing.md },
  filterChip: { marginRight: Spacing.sm },
  list: { flex: 1 },
  card: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardInfo: { flex: 1 },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg },
  input: { marginBottom: Spacing.sm },
  gradePicker: { marginVertical: Spacing.sm },
  gradeChip: { marginRight: Spacing.xs },
})
