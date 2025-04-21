import { useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function SettingsLayout() {
    const navigation = useNavigation();

    useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: 'Nastavenia'
    });
    }, [navigation]);
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}