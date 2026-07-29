import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native'
import { Text, TextInput, Dialog, Portal, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getGrados, createGrado, updateGrado, deleteGrado, getMaterias, createMateria, updateMateria, deleteMateria } from '../../src/services/grades'
import type { Grado, Materia, GradeLevel } from '../../src/types'

const niveles: GradeLevel[] = ['Preescolar', 'Primaria', 'Bachillerato']

export default function GradesScreen() {
  const { colegioActivo } = useSchool()
  const [grados, setGrados] = useState<Grado[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'grados' | 'materias'>('grados')

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
    Alert.alert('Confirmar', '¿Eliminar este elemento?', [
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

  const nivelColor = (nivel: string) => {
    if (nivel === 'Preescolar') return Colors.accent
    if (nivel === 'Primaria') return Colors.primary
    return Colors.success
  }

  const items = tab === 'grados' ? grados : materias

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.screenTitle}>Grados y Materias</Text>

        <View style={styles.tabRow}>
          <Pressable onPress={() => setTab('grados')} style={[styles.tabBtn, tab === 'grados' && styles.tabBtnActive]}>
            <Ionicons name="layers" size={18} color={tab === 'grados' ? Colors.textLight : Colors.textSecondary} />
            <Text style={[styles.tabText, tab === 'grados' && styles.tabTextActive]}>Grados</Text>
          </Pressable>
          <Pressable onPress={() => setTab('materias')} style={[styles.tabBtn, tab === 'materias' && styles.tabBtnActive]}>
            <Ionicons name="book" size={18} color={tab === 'materias' ? Colors.textLight : Colors.textSecondary} />
            <Text style={[styles.tabText, tab === 'materias' && styles.tabTextActive]}>Materias</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {items.map((item: any) => (
            <Pressable key={item.id} onPress={() => openEdit(item)}>
              <Surface style={styles.card} elevation={0}>
                <View style={styles.cardRow}>
                  <View style={[styles.iconBadge, { backgroundColor: (tab === 'grados' ? nivelColor(item.nivel) : Colors.primary) + '15' }]}>
                    <Ionicons name={tab === 'grados' ? 'layers' : 'book'} size={22} color={tab === 'grados' ? nivelColor(item.nivel) : Colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.nombre}</Text>
                    {tab === 'grados' && (
                      <View style={[styles.badge, { backgroundColor: nivelColor(item.nivel) + '15' }]}>
                        <Text style={[styles.badgeText, { color: nivelColor(item.nivel) }]}>{item.nivel}</Text>
                      </View>
                    )}
                    {tab === 'materias' && (
                      <Text style={styles.cardSubtitle}>Código: {item.codigo || '—'}</Text>
                    )}
                  </View>
                  <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
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
          <Text style={styles.dialogTitle}>{editing ? 'Editar' : 'Nuevo'} {tab === 'grados' ? 'Grado' : 'Materia'}</Text>
          <Dialog.Content>
            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm({...form, nombre: v})} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            {tab === 'grados' ? (
              <View>
                <Text style={styles.label}>Nivel</Text>
                <View style={styles.nivelRow}>
                  {niveles.map((n) => (
                    <Pressable key={n} onPress={() => setForm({...form, nivel: n})} style={[styles.nivelChip, form.nivel === n && { backgroundColor: nivelColor(n), borderColor: nivelColor(n) }]}>
                      <Text style={[styles.nivelText, form.nivel === n && { color: Colors.textLight }]}>{n}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <TextInput label="Código" value={form.codigo} onChangeText={(v) => setForm({...form, codigo: v})} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            )}
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
  tabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, ...Shadows.sm },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSizes.md, fontFamily: Fonts.medium, color: Colors.textSecondary },
  tabTextActive: { color: Colors.textLight },
  list: { flex: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  cardTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.semiBold, color: Colors.text },
  cardSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginTop: Spacing.xs },
  badgeText: { fontSize: FontSizes.xs, fontFamily: Fonts.medium },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.secondary + '10', justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', right: Spacing.xl, bottom: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  dialog: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg },
  dialogTitle: { fontSize: FontSizes.xl, fontFamily: Fonts.bold, color: Colors.text, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  input: { marginBottom: Spacing.sm, backgroundColor: Colors.surface },
  label: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  nivelRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  nivelChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
  nivelText: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.text },
  dialogBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  dialogBtnPrimary: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md },
  dialogBtnText: { color: Colors.textLight, fontFamily: Fonts.medium },
  dialogBtnCancel: { color: Colors.textSecondary, fontFamily: Fonts.medium },
})
