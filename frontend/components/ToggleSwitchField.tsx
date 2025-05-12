import { StyleSheet, View, Pressable, Text, TextInput, ViewStyle, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, RelativePathString } from 'expo-router';
import { useState } from 'react';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type UserSecurityType = {
  is_name_hidden: boolean,
  is_phone_hidden: boolean,
  is_email_hidden: boolean,
  is_picture_hidden: boolean
};

type Props<T> = {
    name: string,
    field: keyof T,
    value: boolean,
    handleChange: (field: keyof T, value: boolean) => void,
    style?: ViewStyle,
    iconName?: string,
    isDisabled?: boolean
}

export default function ToggleSwitchField<T>({name, style, iconName, field, value, handleChange, isDisabled = false} : Props<T>) {

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: 55,
      paddingHorizontal: 15,
    },
    fieldContainer: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 12,
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
      alignItems: 'center'
    },
    fieldLabel: {
      flex: 1,
      fontSize: isAccessibilityMode ? 16 * 1.25 : 16,
      opacity: 0.9,
      color: colors.textPrimary,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{name}</Text>
        <Switch 
            disabled={isDisabled}
            trackColor={{ false: '#DDDDDE', true: '#34C759' }}
            thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor={colors.background}
            onValueChange={value => handleChange(field, value)}
            value={value}
        />
      </View>
    </View>
  );
};
  