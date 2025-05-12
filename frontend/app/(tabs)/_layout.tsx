import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getTabScreenOptions } from '@/utils/getTabScreenOptions';
import { useContext, useEffect } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import * as Device from 'expo-device';


export default function TabLayout() {
  const user = useProtectedRoute();
  const { accessToken, isLoading } = useContext(AuthContext);
  const router = useRouter();

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);

  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.replace("/signin");
    }
  }, [accessToken, isLoading]);

  if (user?.is_admin) {
    return (
      <Tabs
        screenOptions={{
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textPrimary,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontSize: 24,
          textAlign: 'center'
        },
        tabBarStyle: {
          backgroundColor: colors.bar,
          paddingTop: 5,
          borderColor: colors.buttonBackground,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarItemStyle: { display: "none" },
        }}
      />
      <Tabs.Screen name="(admin_home)" options={getTabScreenOptions("Hlavná", "home")}/>
      <Tabs.Screen name="(home)" options={{ tabBarItemStyle: {display: 'none'} }}/>
      <Tabs.Screen name="(my_reports)" options={{ tabBarItemStyle: {display: 'none'} }}/>
      <Tabs.Screen name="(add_report)" options={{ tabBarItemStyle: {display: 'none'} }}/>
      <Tabs.Screen name="(notifications)" options={{ tabBarItemStyle: {display: 'none'} }}/>
      <Tabs.Screen name="(settings)" options={getTabScreenOptions("Nastavenia", "settings")}/>
    </Tabs>
    )
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textPrimary,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontSize: 24,
          textAlign: 'center'
        },
        tabBarStyle: {
          backgroundColor: colors.bar,
          paddingTop: 5,
          borderColor: colors.buttonBackground,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarItemStyle: { display: "none" },
        }}
      />
      <Tabs.Screen name="(admin_home)" options={{ tabBarItemStyle: {display: 'none'} }}/>
      <Tabs.Screen name="(home)" options={getTabScreenOptions("Hlavná", "home")}/>
      <Tabs.Screen name="(my_reports)" options={getTabScreenOptions("Moje hlásenia", "list")}/>
      <Tabs.Screen name="(add_report)" options={getTabScreenOptions("Nahlásiť", "add")}/>
      <Tabs.Screen name="(notifications)" options={getTabScreenOptions("Oznámenia", "notifications")}/>
      <Tabs.Screen name="(settings)" options={getTabScreenOptions("Nastavenia", "settings")}/>
    </Tabs>
  );
}