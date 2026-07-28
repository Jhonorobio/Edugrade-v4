import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, Searchbar, Chip, SegmentedButtons } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '../../src/contexts/ThemeContext'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getGrados, createGrado, updateGrado, deleteGrado, getMaterias, createMateria, updateMateria, deleteMateria } from '../../src/services/grades'
import type { Grado, Materia, GradeLevel } from '../../src/types'
import { Spacing, Colors, BorderRadius } from '../../src/constants/theme'

const niveles: GradeLevel[] = ['Preescolar', 'Primaria', 'Bachillerato']

export default function GradesScreen() {
  const { theme } = useTheme()
  const { colegioActivo } = useSchool()
  const [grados, setGrados] = useState<Grado[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('grados')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ nombre: '', nivel: 'Primaria' as GradeLevel, codigo: '' })

  useFocusEffect(useCallback(() => { if (colegioActivo) loadData() }, [colegioActivo]))

  async function loadData() {
    if (!colegioActivo) return
    setLoading(true)
    try {
      const [g, m] = await Promise.all([getGrados(colegioActivo.id), getMaterias()])
      setGrados(g)
      setMaterias(m)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', nivel: 'Primaria', codigo: '' })
    setDialogOpen(true)
  }

  function openEdit(item: any) {
    setEditing(item)
    setForm({ nombre: item.nombre, nivel: item.nivel || 'Primaria', codigo: item.codigo || '' })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nombre || !colegioActivo) { Alert.alert('Error', 'Nombre obligatorio'); return }
    try {
      if (tab === 'grados') {
        if (editing) {
          await updateGrado(editing.id, { nombre: form.nombre, nivel: form.nivel })
        } else {
          await createGrado({ nombre: form.nombre, nivel: form.nivel, colegio_id: colegioActivo.id })
        }
      } else {
        if (editing) {
          await updateMateria(editing.id, { nombre: form.nombre, codigo: form.codigo })
        } else {
          await createMateria({ nombre: form.nombre, codigo: form.codigo, niveles: [form.nivel] })
        }
      }
      setDialogOpen(false)
      loadData()
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  async function handleDelete(id: string) {
    Alert.alert('Confirmar', '¿Eliminar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          if (tab === 'grados') await deleteGrado(id)
          else await deleteMateria(id)
          loadData()
        } catch (e: any) { Alert.alert('Error', e.message) }
      }},
    ])
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Grados y Materias
        </Text>

        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'grados', label: 'Grados' },
            { value: 'materias', label: 'Materias' },
          ]}
          style={styles.tabSelector}
        />

        <ScrollView style={styles.list}>
          {(tab === 'grados' ? grados : materias).map((item: any) => (
            <Card key={item.id} style={styles.card} onPress={() => openEdit(item)}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Ionicons name={tab === 'grados' ? 'layers' : 'book'} size={24} color={Colors.primary} />
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium">{item.nombre}</Text>
                    {tab === 'grados' && (
                      <Text variant="bodySmall" style={{ color: Colors.textSecondary }}>{item.nivel}</Text>
                    )}
                    {tab === 'materias' && (
                      <Text variant="bodySmall" style={{ color: Colors.textSecondary }}>Código: {item.codigo}</Text>
                    )}
                  </View>
                  <Button icon="delete" compact onPress={() => handleDelete(item.id)} textColor={Colors.error}> </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <FAB icon="plus" style={[styles.fab, { backgroundColor: Colors.primary }]} onPress={openCreate} />
      </SafeAreaView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>{editing ? 'Editar' : 'Nuevo'} {tab === 'grados' ? 'Grado' : 'Materia'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm({...form, nombre: v})} mode="outlined" style={styles.input} />
            {tab === 'grados' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {niveles.map((n) => (
                  <Chip key={n} selected={form.nivel === n} onPress={() => setForm({...form, nivel: n})} style={styles.chip}>
                    {n}
                  </Chip>
                ))}
              </ScrollView>
            ) : (
              <TextInput label="Código" value={form.codigo} onChangeText={(v) => setForm({...form, codigo: v})} mode="outlined" style={styles.input} />
            )}
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
  tabSelector: { marginBottom: Spacing.md },
  list: { flex: 1 },
  card: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardInfo: { flex: 1 },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg },
  input: { marginBottom: Spacing.sm },
  chipRow: { marginVertical: Spacing.sm },
  chip: { marginRight: Spacing.xs },
})
