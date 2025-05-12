import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import * as Device from 'expo-device';


export function getTabScreenOptions(label: string, iconName: string): BottomTabNavigationOptions {

  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  return {
    tabBarLabel: ({ color, focused }) => (
      <Text 
        style={{ 
          color, 
          fontSize: isTablet ? 19 : 9, 
          opacity: focused ? 1: 0.6
        }}
      >
        {label}
      </Text>
    ),
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
      name={(
        focused ? `${iconName}-outline` : `${iconName}-outline`
      ) as keyof typeof Ionicons.glyphMap} 
        size={isTablet ? 30 : 24}
        color={color}
        style={{ 
          opacity: focused ? 1 : 0.6
        }}
      />
    ),
  };
}
