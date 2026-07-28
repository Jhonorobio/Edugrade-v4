import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Surface, Button } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/contexts/AuthContext'
import { useSchool } from '../../src/contexts/SchoolContext'
import { useTheme } from '../../src/contexts/ThemeContext'
import { Spacing, Colors, BorderRadius } from '../../src/constants/theme'

export default function DashboardScreen() {
  const { usuario } = useAuth()
  const { colegioActivo } = useSchool()
  const { theme } = useTheme()

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
            Bienvenido, {usuario?.nombre}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {colegioActivo?.nombre || 'Seleccione un colegio'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {usuario?.rol === 'SUPER_ADMIN' ? 'Super Administrador' :
             usuario?.rol === 'ADMIN_COLEGIO' ? 'Administrador' : 'Docente'}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="people" size={32} color={Colors.primary} />
              <Text variant="headlineMedium" style={styles.statNumber}>0</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Usuarios</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="school" size={32} color={Colors.secondary} />
              <Text variant="headlineMedium" style={styles.statNumber}>0</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Alumnos</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="business" size={32} color={Colors.accent} />
              <Text variant="headlineMedium" style={styles.statNumber}>0</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Colegios</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="book" size={32} color={Colors.info} />
              <Text variant="headlineMedium" style={styles.statNumber}>0</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Materias</Text>
            </Card.Content>
          </Card>
        </View>

        <Surface style={styles.quickActions}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <Button mode="outlined" icon="plus" style={styles.actionBtn} onPress={() => {}}>
              Nuevo Alumno
            </Button>
            <Button mode="outlined" icon="account-plus" style={styles.actionBtn} onPress={() => {}}>
              Nuevo Usuario
            </Button>
            <Button mode="outlined" icon="book-plus" style={styles.actionBtn} onPress={() => {}}>
              Nueva Materia
            </Button>
            <Button mode="outlined" icon="file-document" style={styles.actionBtn} onPress={() => {}}>
              Informes
            </Button>
          </View>
        </Surface>
      </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statNumber: {
    fontWeight: 'bold',
    marginTop: Spacing.sm,
  },
  statLabel: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  quickActions: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    fontWeight: '600',
  },
  actionsGrid: {
    gap: Spacing.sm,
  },
  actionBtn: {
    marginBottom: Spacing.sm,
  },
})
