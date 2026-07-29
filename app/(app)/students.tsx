import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native'
import { Text, TextInput, Dialog, Portal, Searchbar, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getAlumnos, createAlumno, updateAlumno, deleteAlumno } from '../../src/services/students'
import { getGrados } from '../../src/services/grades'
import type { Alumno, Grado } from '../../src/types'

export default function StudentsScreen() {
  const { colegioActivo } = useSchool()
  const [alumnos, setAlumnos] = useState<(Alumno & { grados?: { nombre: string } })[]>([])
  const [grados, setGrados] = useState<Grado[]>([])
  const [search, setSearch] = useState('')
  const [gradoFilter, setGradoFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Alumno | null>(null)
  const [form, setForm] = useState({ nombre: '', apellido: '', grado_id: '' })

  useFocusEffect(useCallback(() => { if (colegioActivo) loadData() }, [colegioActivo]))

  async function loadData() {
    if (!colegioActivo) return
    const [a, g] = await Promise.all([getAlumnos(colegioActivo.id), getGrados(colegioActivo.id)])
    setAlumnos(a)
    setGrados(g)
  }

  function openCreate() { setEditing(null); setForm({ nombre: '', apellido: '', grado_id: grados[0]?.id || '' }); setDialogOpen(true) }
  function openEdit(a: Alumno) { setEditing(a); setForm({ nombre: a.nombre, apellido: a.apellido, grado_id: a.grado_id }); setDialogOpen(true) }

  async function handleSave() {
    if (!form.nombre || !form.apellido || !colegioActivo) { Alert.alert('Error', 'Campos obligatorios'); return }
    editing ? await updateAlumno(editing.id, form) : await createAlumno({ ...form, colegio_id: colegioActivo.id, estado: 'activo' })
    setDialogOpen(false); loadData()
  }

  async function handleDelete(id: string) {
    Alert.alert('Eliminar', 'Eliminar alumno?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteAlumno(id); loadData() } },
    ])
  }

  const filtered = alumnos.filter(a => {
    const match = `${a.nombre} ${a.apellido}`.toLowerCase().includes(search.toLowerCase())
    const matchG = !gradoFilter || a.grado_id === gradoFilter
    return match && matchG
  })

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.screenTitle}>Alumnos</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <Searchbar placeholder="Buscar alumno..." value={search} onChangeText={setSearch} style={styles.search} inputStyle={styles.searchInput} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Pressable onPress={() => setGradoFilter('')} style={[styles.filterChip, !gradoFilter && styles.filterActive]}>
            <Text style={[styles.filterText, !gradoFilter && styles.filterTextActive]}>Todos</Text>
          </Pressable>
          {grados.map(g => (
            <Pressable key={g.id} onPress={() => setGradoFilter(gradoFilter === g.id ? '' : g.id)} style={[styles.filterChip, gradoFilter === g.id && styles.filterActive]}>
              <Text style={[styles.filterText, gradoFilter === g.id && styles.filterTextActive]}>{g.nombre}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((a) => (
            <Surface key={a.id} style={styles.card} elevation={0}>
              <View style={styles.cardRow}>
                <View style={[styles.avatar, { backgroundColor: Colors.accent }]}>
                  <Text style={styles.avatarText}>{a.nombre.charAt(0)}{a.apellido.charAt(0)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{a.nombre} {a.apellido}</Text>
                  <Text style={styles.cardSubtitle}>{alumnos.find(x => x.id === a.id)?.grados?.nombre || 'Sin grado'}</Text>
                </View>
                <Pressable onPress={() => handleDelete(a.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.secondary} />
                </Pressable>
              </View>
            </Surface>
          ))}
        </ScrollView>

        <Pressable style={styles.fab} onPress={openCreate}>
          <Ionicons name="add" size={28} color={Colors.textLight} />
        </Pressable>
      </SafeAreaView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)} style={styles.dialog}>
          <Text style={styles.dialogTitle}>{editing ? 'Editar' : 'Nuevo'} Alumno</Text>
          <Dialog.Content>
            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm({...form, nombre: v})} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <TextInput label="Apellido" value={form.apellido} onChangeText={(v) => setForm({...form, apellido: v})} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <Text style={styles.label}>Grado</Text>
            <View style={styles.roleRow}>
              {grados.map(g => (
                <Pressable key={g.id} onPress={() => setForm({...form, grado_id: g.id})} style={[styles.roleChip, form.grado_id === g.id && styles.filterActive]}>
                  <Text style={[styles.filterText, form.grado_id === g.id && styles.filterTextActive]}>{g.nombre}</Text>
                </Pressable>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Pressable onPress={() => setDialogOpen(false)} style={styles.dialogBtn}><Text style={styles.dialogBtnCancel}>Cancelar</Text></Pressable>
            <Pressable onPress={handleSave} style={[styles.dialogBtn, styles.dialogBtnPrimary]}><Text style={styles.dialogBtnText}>{editing ? 'Guardar' : 'Crear'}</Text></Pressable>
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  search: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md },
  searchInput: { fontFamily: Fonts.regular },
  filterRow: { marginBottom: Spacing.md },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm, backgroundColor: Colors.surface },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.text },
  filterTextActive: { color: Colors.textLight },
  list: { flex: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FontSizes.sm, fontFamily: Fonts.bold, color: Colors.textLight },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  cardTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.semiBold, color: Colors.text },
  cardSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: Spacing.sm },
  fab: { position: 'absolute', right: Spacing.xl, bottom: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  dialog: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg },
  dialogTitle: { fontSize: FontSizes.xl, fontFamily: Fonts.bold, color: Colors.text, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  input: { marginBottom: Spacing.sm, backgroundColor: Colors.surface },
  label: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  roleChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  dialogBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  dialogBtnPrimary: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md },
  dialogBtnText: { color: Colors.textLight, fontFamily: Fonts.medium },
  dialogBtnCancel: { color: Colors.textSecondary, fontFamily: Fonts.medium },
})
