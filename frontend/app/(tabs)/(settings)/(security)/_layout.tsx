import { useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function SecurityLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="changePassword" options={{ headerShown: false}}/>
    </Stack>
  );
}