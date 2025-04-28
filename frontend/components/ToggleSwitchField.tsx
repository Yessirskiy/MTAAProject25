import { StyleSheet, View, Pressable, Text, TextInput, ViewStyle, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, RelativePathString } from 'expo-router';
import { useState } from 'react';

type UserSecurityType = {
  is_name_hidden: boolean,
  is_phone_hidden: boolean,
  is_email_hidden: boolean,
  is_picture_hidden: boolean
};

type Props = {
    name: string,
    field: keyof UserSecurityType,
    value: boolean,
    handleChange: (field: keyof UserSecurityType, value: boolean) => void,
    style?: ViewStyle,
    iconName?: string,
}

export default function ToggleSwitchField({name, style, iconName, field, value, handleChange} : Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{name}</Text>
        <Switch 
            trackColor={{ false: '#DDDDDE', true: '#34C759' }}
            thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#DDDDDE"
            onValueChange={value => handleChange(field, value)}
            value={value}
        />
      </View>
    </View>
  );
};

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
    backgroundColor: "#F1F1F1",
    borderRadius: 8,
    alignItems: 'center'
  },
  fieldLabel: {
    flex: 1,
    fontSize: 16,
    opacity: 0.9
  },
});
  