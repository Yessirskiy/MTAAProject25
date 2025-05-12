import { useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useLayoutEffect } from 'react';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';

export default function SettingsLayout() {
  const navigation = useNavigation();

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Nastavenia',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle:{
        color: colors.textPrimary,
        fontSize: 24
      },
    });
  }, [navigation, colors]);
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        <Stack.Screen name="(security)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="appearance" options={{ headerShown: false }} />
    </Stack>
  );
}