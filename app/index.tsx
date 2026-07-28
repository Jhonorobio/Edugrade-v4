import { Redirect } from 'expo-router'
import { useAuth } from '../src/contexts/AuthContext'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

export default function Index() {
  const { usuario, initialized } = useAuth()

  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!usuario) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(app)" />
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
