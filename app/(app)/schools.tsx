import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, Searchbar, Chip } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '../../src/contexts/ThemeContext'
import { getColegios, createColegio, updateColegio, deleteColegio } from '../../src/services/schools'
import type { Colegio } from '../../src/types'
import { Spacing, Colors, BorderRadius } from '../../src/constants/theme'

export default function SchoolsScreen() {
  const { theme } = useTheme()
  const [colegios, setColegios] = useState<Colegio[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Colegio | null>(null)
  const [form, setForm] = useState({ nombre: '', codigo: '', direccion: '', telefono: '', email: '' })

  useFocusEffect(useCallback(() => { loadColegios() }, []))

  async function loadColegios() {
    setLoading(true)
    try {
      const data = await getColegios()
      setColegios(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', codigo: '', direccion: '', telefono: '', email: '' })
    setDialogOpen(true)
  }

  function openEdit(colegio: Colegio) {
    setEditing(colegio)
    setForm({
      nombre: colegio.nombre,
      codigo: colegio.codigo,
      direccion: colegio.direccion || '',
      telefono: colegio.telefono || '',
      email: colegio.email || '',
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nombre || !form.codigo) {
      Alert.alert('Error', 'Nombre y código son obligatorios')
      return
    }
    try {
      if (editing) {
        await updateColegio(editing.id, form)
      } else {
        await createColegio(form)
      }
      setDialogOpen(false)
      loadColegios()
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  async function handleDelete(id: string) {
    Alert.alert('Confirmar', '¿Eliminar este colegio?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteColegio(id); loadColegios() }
        catch (e: any) { Alert.alert('Error', e.message) }
      }},
    ])
  }

  const filtered = colegios.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.codigo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Colegios
        </Text>

        <Searchbar
          placeholder="Buscar colegio..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <ScrollView style={styles.list}>
          {filtered.map((colegio) => (
            <Card key={colegio.id} style={styles.card} onPress={() => openEdit(colegio)}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="business" size={24} color={Colors.primary} />
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium">{colegio.nombre}</Text>
                    <Text variant="bodySmall" style={{ color: Colors.textSecondary }}>
                      Código: {colegio.codigo}
                    </Text>
                  </View>
                </View>
                {colegio.direccion && (
                  <Text variant="bodySmall" style={{ color: Colors.textSecondary, marginTop: Spacing.xs }}>
                    {colegio.direccion}
                  </Text>
                )}
              </Card.Content>
              <Card.Actions>
                <Button icon="delete" onPress={() => handleDelete(colegio.id)} textColor={Colors.error}>
                  Eliminar
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </ScrollView>

        <FAB icon="plus" style={[styles.fab, { backgroundColor: Colors.primary }]} onPress={openCreate} />
      </SafeAreaView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>{editing ? 'Editar Colegio' : 'Nuevo Colegio'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm({...form, nombre: v})} mode="outlined" style={styles.input} />
            <TextInput label="Código" value={form.codigo} onChangeText={(v) => setForm({...form, codigo: v})} mode="outlined" style={styles.input} />
            <TextInput label="Dirección" value={form.direccion} onChangeText={(v) => setForm({...form, direccion: v})} mode="outlined" style={styles.input} />
            <TextInput label="Teléfono" value={form.telefono} onChangeText={(v) => setForm({...form, telefono: v})} mode="outlined" style={styles.input} keyboardType="phone-pad" />
            <TextInput label="Email" value={form.email} onChangeText={(v) => setForm({...form, email: v})} mode="outlined" style={styles.input} keyboardType="email-address" />
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
  search: { marginBottom: Spacing.md },
  list: { flex: 1 },
  card: { marginBottom: Spacing.sm },
  cardContent: {},
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardInfo: { flex: 1 },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg },
  input: { marginBottom: Spacing.sm },
})
