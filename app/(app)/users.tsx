import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native'
import { Text, TextInput, Dialog, Portal, Searchbar, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getUsuarios, createUsuario, updateUsuario } from '../../src/services/auth'
import type { Usuario, UserRole } from '../../src/types'

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin', ADMIN_COLEGIO: 'Admin Colegio', DOCENTE: 'Docente',
}

export default function UsersScreen() {
  const { colegioActivo } = useSchool()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [form, setForm] = useState({ nombre: '', email: '', username: '', password: '', rol: 'DOCENTE' as UserRole, genero: '' })

  useFocusEffect(useCallback(() => { loadUsuarios() }, [colegioActivo]))

  async function loadUsuarios() {
    setLoading(true)
    try { setUsuarios(await getUsuarios(colegioActivo?.id)) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', email: '', username: '', password: '', rol: 'DOCENTE', genero: '' })
    setDialogOpen(true)
  }

  function openEdit(u: Usuario) {
    setEditing(u)
    setForm({ nombre: u.nombre, email: u.email, username: u.username, password: '', rol: u.rol, genero: u.genero || '' })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nombre || !form.username) { Alert.alert('Error', 'Nombre y username obligatorios'); return }
    try {
      if (editing) {
        await updateUsuario(editing.id, { nombre: form.nombre, email: form.email, rol: form.rol, genero: form.genero as any })
      } else {
        if (!form.password) { Alert.alert('Error', 'Contrasena obligatoria'); return }
        await createUsuario({ ...form, genero: form.genero as any, password: form.password })
      }
      setDialogOpen(false)
      loadUsuarios()
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  const filtered = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase())
  )

  const roleColor = (r: UserRole) => {
    if (r === 'SUPER_ADMIN') return Colors.primary
    if (r === 'ADMIN_COLEGIO') return Colors.accent
    return Colors.success
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.screenTitle}>Usuarios</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <Searchbar placeholder="Buscar usuario..." value={search} onChangeText={setSearch} style={styles.search} inputStyle={styles.searchInput} />
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((u) => (
            <Pressable key={u.id} onPress={() => openEdit(u)}>
              <Surface style={styles.card} elevation={0}>
                <View style={styles.cardRow}>
                  <View style={[styles.avatar, { backgroundColor: roleColor(u.rol) }]}>
                    <Text style={styles.avatarText}>{u.nombre.charAt(0)}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{u.nombre}</Text>
                    <Text style={styles.cardSubtitle}>@{u.username}</Text>
                    <View style={styles.badges}>
                      <View style={[styles.badge, { backgroundColor: roleColor(u.rol) + '20' }]}>
                        <Text style={[styles.badgeText, { color: roleColor(u.rol) }]}>{roleLabels[u.rol]}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: u.estado === 'activo' ? Colors.success + '20' : Colors.secondary + '20' }]}>
                        <Text style={[styles.badgeText, { color: u.estado === 'activo' ? Colors.success : Colors.secondary }]}>{u.estado}</Text>
                      </View>
                    </View>
                  </View>
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
          <Text style={styles.dialogTitle}>{editing ? 'Editar' : 'Nuevo'} Usuario</Text>
          <Dialog.Content>
            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm({...form, nombre: v})} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <TextInput label="Username" value={form.username} onChangeText={(v) => setForm({...form, username: v})} mode="outlined" style={styles.input} autoCapitalize="none" outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            <TextInput label="Email" value={form.email} onChangeText={(v) => setForm({...form, email: v})} mode="outlined" style={styles.input} keyboardType="email-address" outlineColor={Colors.border} activeOutlineColor={Colors.primary} />
            {!editing && <TextInput label="Contrasena" value={form.password} onChangeText={(v) => setForm({...form, password: v})} mode="outlined" style={styles.input} secureTextEntry outlineColor={Colors.border} activeOutlineColor={Colors.primary} />}
            <Text style={styles.label}>Rol</Text>
            <View style={styles.roleRow}>
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <Pressable key={r} onPress={() => setForm({...form, rol: r})} style={[styles.roleChip, form.rol === r && { backgroundColor: roleColor(r), borderColor: roleColor(r) }]}>
                  <Text style={[styles.roleText, form.rol === r && { color: Colors.textLight }]}>{roleLabels[r]}</Text>
                </Pressable>
              ))}
            </View>
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
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FontSizes.xl, fontFamily: Fonts.bold, color: Colors.textLight },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  cardTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.semiBold, color: Colors.text },
  cardSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: FontSizes.xs, fontFamily: Fonts.medium },
  fab: { position: 'absolute', right: Spacing.xl, bottom: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  dialog: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg },
  dialogTitle: { fontSize: FontSizes.xl, fontFamily: Fonts.bold, color: Colors.text, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  input: { marginBottom: Spacing.sm, backgroundColor: Colors.surface },
  label: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  roleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  roleChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
  roleText: { fontSize: FontSizes.sm, fontFamily: Fonts.medium, color: Colors.text },
  dialogBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  dialogBtnPrimary: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md },
  dialogBtnText: { color: Colors.textLight, fontFamily: Fonts.medium },
  dialogBtnCancel: { color: Colors.textSecondary, fontFamily: Fonts.medium },
})
