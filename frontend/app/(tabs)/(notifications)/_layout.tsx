import { Stack, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


export default function NotificationsStack() {
  const navigation = useNavigation();

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Oznámenia',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle:{
        color: colors.textPrimary,
        fontSize: 24
      },
    });
  }, [navigation, colors]);
  return <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="[id]" options={{ headerShown: false }} />
  </Stack>;
}
