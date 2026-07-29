import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native'
import { Text, TextInput, Dialog, Portal, Searchbar, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'
import { getColegios, createColegio, updateColegio, deleteColegio } from '../../src/services/schools'
import type { Colegio } from '../../src/types'

export default function SchoolsScreen() {
  const [colegios, setColegios] = useState<Colegio[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Colegio | null>(null)
  const [form, setForm] = useState({ nombre: '', codigo: '', direccion: '', telefono: '', email: '' })

  useFocusEffect(useCallback(() => { loadColegios() }, []))

  async function loadColegios() {
    setLoading(true)
    try { setColegios(await getColegios()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', codigo: '', direccion: '', telefono: '', email: '' })
    setDialogOpen(true)
  }

  function openEdit(c: Colegio) {
    setEditing(c)
    setForm({ nombre: c.nombre, codigo: c.codigo, direccion: c.direccion || '', telefono: c.telefono || '', email: c.email || '' })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nombre || !form.codigo) { Alert.alert('Error', 'Nombre y codigo son obligatorios'); return }
    try {
      editing ? await updateColegio(editing.id, form) : await createColegio(form)
      setDialogOpen(false)
      loadColegios()
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  async function handleDelete(id: string) {
    Alert.alert('Eliminar', 'Eliminar este colegio?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteColegio(id); loadColegios() } catch (e: any) { Alert.alert('Error', e.message) }
      }},
    ])
  }

  const filtered = colegios.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) || c.codigo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.screenTitle}>Colegios</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <Searchbar placeholder="Buscar colegio..." value={search} onChangeText={setSearch} style={styles.search} inputStyle={styles.searchInput} />
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((c) => (
            <Pressable key={c.id} onPress={() => openEdit(c)}>
              <Surface style={styles.card} elevation={0}>
                <View style={styles.cardRow}>
                  <View style={[styles.cardIcon, { backgroundColor: Colors.primary + '15' }]}>
                    <Ionicons name="business" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{c.nombre}</Text>
                    <Text style={styles.cardSubtitle}>Codigo: {c.codigo}</Text>
                    {c.direccion && <Text style={styles.cardDetail}>{c.direccion}</Text>}
                  </View>
                  <Pressable onPress={() => handleDelete(c.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color={Colors.secondary} />
                  </Pressable>
                </View>
              </Surface>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable style={styles.fab} onPress={openCreate}>
          <Ionicons name="add" size={28} color={Colors.textLight} />
        </Pressable>
      </SafeAreaView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)} style={styles.dialog}>
          <Text style={styles.dialogTitle}>{editing ? 'Editar' : 'Nuevo'} Colegio</Text>
          <Dialog.Content>
            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm({...form, nombre: v})} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <TextInput label="Codigo" value={form.codigo} onChangeText={(v) => setForm({...form, codigo: v})} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <TextInput label="Direccion" value={form.direccion} onChangeText={(v) => setForm({...form, direccion: v})} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <TextInput label="Telefono" value={form.telefono} onChangeText={(v) => setForm({...form, telefono: v})} mode="outlined" style={styles.input} keyboardType="phone-pad" outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <TextInput label="Email" value={form.email} onChangeText={(v) => setForm({...form, email: v})} mode="outlined" style={styles.input} keyboardType="email-address" outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
          </Dialog.Content>
          <Dialog.Actions>
            <Pressable onPress={() => setDialogOpen(false)} style={styles.dialogBtn}>
              <Text style={styles.dialogBtnCancel}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.dialogBtn, styles.dialogBtnPrimary]}>
              <Text style={styles.dialogBtnText}>{editing ? 'Guardar' : 'Crear'}</Text>
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, gap: Spacing.sm },
  search: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md },
  searchInput: { fontFamily: Fonts.regular },
  list: { flex: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  cardTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.semiBold, color: Colors.text },
  cardSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  cardDetail: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: Spacing.sm },
  fab: { position: 'absolute', right: Spacing.xl, bottom: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  dialog: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg },
  dialogTitle: { fontSize: FontSizes.xl, fontFamily: Fonts.bold, color: Colors.text, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  input: { marginBottom: Spacing.sm, backgroundColor: Colors.surface },
  dialogActions: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  dialogBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  dialogBtnPrimary: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md },
  dialogBtnText: { color: Colors.textLight, fontFamily: Fonts.medium },
  dialogBtnCancel: { color: Colors.textSecondary, fontFamily: Fonts.medium },
})
