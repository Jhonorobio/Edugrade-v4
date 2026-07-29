import { useState, useEffect } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { TextInput, Button, Text, HelperText } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/contexts/AuthContext'
import { Colors, Spacing, BorderRadius, Fonts, FontSizes, Shadows } from '../../src/constants/theme'

export default function LoginScreen() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { usuario, login, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (usuario) {
      router.replace('/(app)')
    }
  }, [usuario])

  async function handleLogin() {
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios')
      return
    }
    try {
      await login(username.trim(), password)
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesion')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="school" size={48} color={Colors.primary} />
            </View>

            <Text style={styles.title}>EduGrade</Text>
            <Text style={styles.subtitle}>Sistema de Gestion Escolar</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Usuario"
                  value={username}
                  onChangeText={setUsername}
                  mode="flat"
                  autoCapitalize="none"
                  autoComplete="username"
                  style={styles.input}
                  underlineColor="transparent"
                  theme={{ colors: { primary: Colors.primary, background: Colors.surface } }}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Contrasena"
                  value={password}
                  onChangeText={setPassword}
                  mode="flat"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={styles.input}
                  underlineColor="transparent"
                  theme={{ colors: { primary: Colors.primary, background: Colors.surface } }}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                      color={Colors.textSecondary}
                    />
                  }
                />
              </View>

              {error ? (
                <HelperText type="error" visible={!!error} style={styles.error}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                buttonColor={Colors.primary}
              >
                Iniciar Sesion
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    ...Shadows.md,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 56,
    ...Shadows.sm,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: FontSizes.lg,
  },
  button: {
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  buttonContent: {
    height: 56,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.medium,
    letterSpacing: 0.5,
  },
  error: {
    fontSize: FontSizes.sm,
  },
})
