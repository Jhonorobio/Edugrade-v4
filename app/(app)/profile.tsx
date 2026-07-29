import { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native'
import { Text, Switch, Dialog, Portal, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/contexts/AuthContext'
import { useTheme } from '../../src/contexts/ThemeContext'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'

export default function ProfileScreen() {
  const { usuario, logout, loading } = useAuth()
  const { isDark, setThemeMode } = useTheme()
  const [logoutDialog, setLogoutDialog] = useState(false)

  async function handleLogout() {
    try { await logout() }
    catch (e: any) { Alert.alert('Error', e.message) }
  }

  const roleLabel = (rol?: string) => {
    if (rol === 'SUPER_ADMIN') return 'Super Administrador'
    if (rol === 'ADMIN_COLEGIO') return 'Administrador'
    return 'Docente'
  }

  const roleColor = (rol?: string) => {
    if (rol === 'SUPER_ADMIN') return Colors.primary
    if (rol === 'ADMIN_COLEGIO') return Colors.accent
    return Colors.success
  }

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.screenTitle}>Mi Perfil</Text>

        <Surface style={styles.profileCard} elevation={0}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{usuario?.nombre?.charAt(0) || '?'}</Text>
          </View>
          <Text style={styles.profileName}>{usuario?.nombre}</Text>
          <Text style={styles.profileUsername}>@{usuario?.username}</Text>
          <Text style={styles.profileEmail}>{usuario?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor(usuario?.rol) + '15' }]}>
            <Text style={[styles.roleBadgeText, { color: roleColor(usuario?.rol) }]}>{roleLabel(usuario?.rol)}</Text>
          </View>
        </Surface>

        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person" size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Rol</Text>
              <Text style={styles.infoValue}>{roleLabel(usuario?.rol)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={styles.infoValue}>{usuario?.estado || 'Activo'}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIcon}>
              <Ionicons name="male-female" size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Género</Text>
              <Text style={styles.infoValue}>{usuario?.genero || 'No especificado'}</Text>
            </View>
          </View>
        </Surface>

        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Apariencia</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIcon}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tema Oscuro</Text>
              <Text style={styles.infoValue}>{isDark ? 'Activado' : 'Desactivado'}</Text>
            </View>
            <Switch value={isDark} onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')} />
          </View>
        </Surface>

        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.success} />
            <Text style={styles.sectionTitle}>Acerca de</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="pricetag" size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Versión</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIcon}>
              <Ionicons name="phone-portrait" size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Plataforma</Text>
              <Text style={styles.infoValue}>Expo (Web + Móvil)</Text>
            </View>
          </View>
        </Surface>

        <Pressable style={styles.logoutBtn} onPress={() => setLogoutDialog(true)}>
          <Ionicons name="log-out" size={20} color={Colors.textLight} />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </Pressable>
      </SafeAreaView>

      <Portal>
        <Dialog visible={logoutDialog} onDismiss={() => setLogoutDialog(false)} style={styles.dialog}>
          <Text style={styles.dialogTitle}>Cerrar Sesión</Text>
          <Dialog.Content>
            <Text style={styles.dialogText}>¿Está seguro de que desea cerrar sesión?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Pressable onPress={() => setLogoutDialog(false)} style={styles.dialogBtn}>
              <Text style={styles.dialogBtnCancel}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleLogout} style={[styles.dialogBtn, styles.dialogBtnDanger]}>
              <Text style={styles.dialogBtnDangerText}>Cerrar Sesión</Text>
            </Pressable>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { padding: Spacing.xl },
  screenTitle: { fontSize: FontSizes.h1, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.xl },
  profileCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg, ...Shadows.sm },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  avatarLargeText: { fontSize: FontSizes.title, fontFamily: Fonts.bold, color: Colors.textLight },
  profileName: { fontSize: FontSizes.h2, fontFamily: Fonts.bold, color: Colors.text },
  profileUsername: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  profileEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round },
  roleBadgeText: { fontSize: FontSizes.sm, fontFamily: Fonts.semiBold },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.semiBold, color: Colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FontSizes.xs, fontFamily: Fonts.medium, color: Colors.textSecondary },
  infoValue: { fontSize: FontSizes.md, fontFamily: Fonts.medium, color: Colors.text, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', marginTop: Spacing.lg, paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, ...Shadows.md },
  logoutBtnText: { fontSize: FontSizes.lg, fontFamily: Fonts.semiBold, color: Colors.textLight },
  dialog: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg },
  dialogTitle: { fontSize: FontSizes.xl, fontFamily: Fonts.bold, color: Colors.text, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  dialogText: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22 },
  dialogBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  dialogBtnCancel: { color: Colors.textSecondary, fontFamily: Fonts.medium },
  dialogBtnDanger: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.md },
  dialogBtnDangerText: { color: Colors.textLight, fontFamily: Fonts.medium },
})
