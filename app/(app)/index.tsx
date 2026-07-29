import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Text, Surface } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/contexts/AuthContext'
import { useSchool } from '../../src/contexts/SchoolContext'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'

export default function DashboardScreen() {
  const { usuario } = useAuth()
  const { colegioActivo } = useSchool()

  const stats = [
    { label: 'Colegios', value: '0', icon: 'business', color: Colors.primary },
    { label: 'Usuarios', value: '0', icon: 'people', color: Colors.accent },
    { label: 'Alumnos', value: '0', icon: 'school', color: Colors.success },
    { label: 'Materias', value: '0', icon: 'book', color: Colors.secondary },
  ]

  const quickActions = [
    { label: 'Nuevo Alumno', icon: 'person-add', color: Colors.primary },
    { label: 'Nuevo Usuario', icon: 'person-add', color: Colors.accent },
    { label: 'Nueva Materia', icon: 'book-outline', color: Colors.success },
    { label: 'Calificaciones', icon: 'calculator', color: Colors.secondary },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {usuario?.nombre?.split(' ')[0]}</Text>
            <Text style={styles.subGreeting}>
              {colegioActivo?.nombre || 'Selecciona un colegio'}
            </Text>
          </View>
          <Pressable style={styles.avatar}>
            <Text style={styles.avatarText}>
              {usuario?.nombre?.charAt(0) || 'A'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <Surface key={i} style={styles.statCard} elevation={0}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Surface>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Acciones Rapidas</Text>
          </View>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, i) => (
              <Pressable key={i} style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resumen</Text>
          </View>
          <Surface style={styles.summaryCard} elevation={0}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>0</Text>
                <Text style={styles.summaryLabel}>Periodos Activos</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>0</Text>
                <Text style={styles.summaryLabel}>Asignaciones</Text>
              </View>
            </View>
          </Surface>
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSizes.h1,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  subGreeting: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.bold,
    color: Colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.h2,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.h3,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
    color: Colors.text,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FontSizes.h2,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
})
