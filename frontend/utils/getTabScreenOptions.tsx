import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

export function getTabScreenOptions(label: string, iconName: string): BottomTabNavigationOptions {
  return {
    tabBarLabel: ({ color, focused }) => (
      <Text 
        style={{ 
          color, 
          fontSize: 9, 
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
        size={24}
        color={color}
        style={{ 
          opacity: focused ? 1 : 0.6
        }}
      />
    ),
  };
}
