import { Text, View, StyleSheet } from 'react-native';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function NotificationsScreen() {
  const user = useProtectedRoute();
  if (!user) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notifications screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
