import { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, Button, Switch, Dialog, Portal, List, Divider, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/contexts/AuthContext'
import { useTheme } from '../../src/contexts/ThemeContext'
import { Spacing, Colors, BorderRadius } from '../../src/constants/theme'

export default function ProfileScreen() {
  const { usuario, logout, loading } = useAuth()
  const { theme, isDark, themeMode, setThemeMode } = useTheme()
  const [logoutDialog, setLogoutDialog] = useState(false)

  async function handleLogout() {
    try {
      await logout()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.profileHeader}>
          <Ionicons name="person-circle" size={80} color={Colors.primary} />
          <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onBackground }]}>
            {usuario?.nombre}
          </Text>
          <Text variant="bodyMedium" style={{ color: Colors.textSecondary }}>
            @{usuario?.username}
          </Text>
          <Text variant="bodySmall" style={{ color: Colors.textSecondary }}>
            {usuario?.email}
          </Text>
        </View>

        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Información de la Cuenta</Text>
          <Divider />
          <List.Item
            title="Rol"
            description={usuario?.rol === 'SUPER_ADMIN' ? 'Super Administrador' : usuario?.rol === 'ADMIN_COLEGIO' ? 'Administrador' : 'Docente'}
            left={props => <List.Icon {...props} icon="shield-account" />}
          />
          <List.Item
            title="Estado"
            description={usuario?.estado || 'Activo'}
            left={props => <List.Icon {...props} icon="check-circle" />}
          />
          <List.Item
            title="Género"
            description={usuario?.genero || 'No especificado'}
            left={props => <List.Icon {...props} icon="account" />}
          />
        </Surface>

        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Apariencia</Text>
          <Divider />
          <List.Item
            title="Tema Oscuro"
            description={isDark ? 'Activado' : 'Desactivado'}
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDark}
                onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
              />
            )}
          />
        </Surface>

        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Acerca de</Text>
          <Divider />
          <List.Item title="Versión" description="1.0.0" left={props => <List.Icon {...props} icon="information" />} />
          <List.Item title="Plataforma" description="Expo (Web + Móvil)" left={props => <List.Icon {...props} icon="cellphone" />} />
        </Surface>

        <Button
          mode="contained"
          icon="logout"
          onPress={() => setLogoutDialog(true)}
          loading={loading}
          buttonColor={Colors.error}
          style={styles.logoutBtn}
        >
          Cerrar Sesión
        </Button>
      </SafeAreaView>

      <Portal>
        <Dialog visible={logoutDialog} onDismiss={() => setLogoutDialog(false)}>
          <Dialog.Title>Cerrar Sesión</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">¿Está seguro de que desea cerrar sesión?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialog(false)}>Cancelar</Button>
            <Button onPress={handleLogout} textColor={Colors.error}>Cerrar Sesión</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { padding: Spacing.lg },
  profileHeader: { alignItems: 'center', marginBottom: Spacing.xxl },
  name: { fontWeight: 'bold', marginTop: Spacing.md },
  section: { marginBottom: Spacing.lg, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  sectionTitle: { padding: Spacing.lg, paddingBottom: Spacing.sm, fontWeight: '600' },
  logoutBtn: { marginTop: Spacing.lg, borderRadius: BorderRadius.md },
})
