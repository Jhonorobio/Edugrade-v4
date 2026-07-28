import { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, Searchbar, Chip, Menu, Switch } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '../../src/contexts/ThemeContext'
import { useSchool } from '../../src/contexts/SchoolContext'
import { getUsuarios, createUsuario, updateUsuario } from '../../src/services/auth'
import type { Usuario, UserRole } from '../../src/types'
import { Spacing, Colors, BorderRadius, Roles } from '../../src/constants/theme'

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_COLEGIO: 'Admin Colegio',
  DOCENTE: 'Docente',
}

export default function UsersScreen() {
  const { theme } = useTheme()
  const { colegioActivo } = useSchool()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [form, setForm] = useState({ nombre: '', email: '', username: '', password: '', rol: 'DOCENTE' as UserRole, genero: '' })
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  useFocusEffect(useCallback(() => { loadUsuarios() }, [colegioActivo]))

  async function loadUsuarios() {
    setLoading(true)
    try {
      const data = await getUsuarios(colegioActivo?.id)
      setUsuarios(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', email: '', username: '', password: '', rol: 'DOCENTE', genero: '' })
    setDialogOpen(true)
  }

  function openEdit(usuario: Usuario) {
    setEditing(usuario)
    setForm({ nombre: usuario.nombre, email: usuario.email, username: usuario.username, password: '', rol: usuario.rol, genero: usuario.genero || '' })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nombre || !form.username) {
      Alert.alert('Error', 'Nombre y username son obligatorios')
      return
    }
    try {
      if (editing) {
        await updateUsuario(editing.id, { nombre: form.nombre, email: form.email, rol: form.rol, genero: form.genero as any })
      } else {
        if (!form.password) { Alert.alert('Error', 'Contraseña obligatoria'); return }
        await createUsuario({ ...form, genero: form.genero as any, password: form.password })
      }
      setDialogOpen(false)
      loadUsuarios()
    } catch (e: any) { Alert.alert('Error', e.message) }
  }

  const filtered = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor = (estado: string) => {
    switch (estado) {
      case 'activo': return Colors.statusActive
      case 'inactivo': return Colors.statusInactive
      case 'suspendido': return Colors.statusSuspended
      default: return Colors.disabled
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Usuarios
        </Text>

        <Searchbar placeholder="Buscar usuario..." value={search} onChangeText={setSearch} style={styles.search} />

        <ScrollView style={styles.list}>
          {filtered.map((usuario) => (
            <Card key={usuario.id} style={styles.card} onPress={() => openEdit(usuario)}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Ionicons name="person-circle" size={40} color={Colors.primary} />
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium">{usuario.nombre}</Text>
                    <Text variant="bodySmall" style={{ color: Colors.textSecondary }}>@{usuario.username}</Text>
                    <Text variant="bodySmall" style={{ color: Colors.textSecondary }}>{usuario.email}</Text>
                  </View>
                  <Chip
                    mode="flat"
                    textStyle={{ fontSize: 11 }}
                    style={[styles.statusChip, { backgroundColor: statusColor(usuario.estado) + '20' }]}
                  >
                    {usuario.estado}
                  </Chip>
                </View>
                <Chip mode="outlined" textStyle={{ fontSize: 11 }} style={styles.roleChip}>
                  {roleLabels[usuario.rol]}
                </Chip>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <FAB icon="plus" style={[styles.fab, { backgroundColor: Colors.primary }]} onPress={openCreate} />
      </SafeAreaView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => setForm({...form, nombre: v})} mode="outlined" style={styles.input} />
            <TextInput label="Email" value={form.email} onChangeText={(v) => setForm({...form, email: v})} mode="outlined" style={styles.input} keyboardType="email-address" />
            <TextInput label="Username" value={form.username} onChangeText={(v) => setForm({...form, username: v})} mode="outlined" style={styles.input} autoCapitalize="none" />
            {!editing && (
              <TextInput label="Contraseña" value={form.password} onChangeText={(v) => setForm({...form, password: v})} mode="outlined" style={styles.input} secureTextEntry />
            )}
            <Menu
              visible={roleMenuOpen}
              onDismiss={() => setRoleMenuOpen(false)}
              anchor={
                <Button mode="outlined" onPress={() => setRoleMenuOpen(true)} style={styles.input}>
                  Rol: {roleLabels[form.rol]}
                </Button>
              }
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <Menu.Item key={value} title={label} onPress={() => { setForm({...form, rol: value as UserRole}); setRoleMenuOpen(false) }} />
              ))}
            </Menu>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardInfo: { flex: 1 },
  statusChip: { height: 24 },
  roleChip: { marginTop: Spacing.sm, alignSelf: 'flex-start' },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg },
  input: { marginBottom: Spacing.sm },
})
