import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getTabScreenOptions } from '@/utils/getTabScreenOptions';
import { useContext, useEffect } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { accessToken, isLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.replace("/signin");
    }
  }, [accessToken, isLoading]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#000000',
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTintColor: '#000000',
        headerTitleStyle: {
          color: '#000000',
          fontSize: 24,
          textAlign: 'center'
        },
        tabBarStyle: {
          backgroundColor: '#D9D9D9',
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen name="index" options={getTabScreenOptions("Hlavná", "home")}/>
      <Tabs.Screen name="(my_reports)" options={getTabScreenOptions("Moje hlásenia", "list")}/>
      <Tabs.Screen name="(add_report)" options={getTabScreenOptions("Nahlásiť", "add")}/>
      <Tabs.Screen name="(notifications)" options={getTabScreenOptions("Oznámenia", "notifications")}/>
      <Tabs.Screen name="(settings)" options={getTabScreenOptions("Nastavenia", "settings")}/>
      <Tabs.Screen name="map_test" options={getTabScreenOptions("Mapy", "settings")}/>
    </Tabs>
  );
}