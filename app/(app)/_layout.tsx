import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Fonts, FontSizes } from '../../src/constants/theme'
import { Platform } from 'react-native'

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: Fonts.medium,
          fontSize: FontSizes.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schools"
        options={{
          title: 'Colegios',
          tabBarIcon: ({ color, size }) => <Ionicons name="business" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Alumnos',
          tabBarIcon: ({ color, size }) => <Ionicons name="school" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: 'Grados',
          tabBarIcon: ({ color, size }) => <Ionicons name="layers" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Asignaciones',
          tabBarIcon: ({ color, size }) => <Ionicons name="git-merge" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="grading"
        options={{
          title: 'Notas',
          tabBarIcon: ({ color, size }) => <Ionicons name="calculator" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Informes',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={22} color={color} />,
        }}
      />
    </Tabs>
  )
}
