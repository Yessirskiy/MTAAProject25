import { Stack, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function HomeStack() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Bratislava'
    });
  }, [navigation]);
  return <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
  </Stack>;
}