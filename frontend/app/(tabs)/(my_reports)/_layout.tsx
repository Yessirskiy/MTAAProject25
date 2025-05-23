import { Stack, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function NotificationsStack() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Moje hlásenia'
    });
  }, [navigation]);
  return <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
  </Stack>;
}
