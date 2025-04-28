import { StyleSheet, View, Pressable, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, RelativePathString } from 'expo-router';
import { useState } from 'react';

type UserDataType = {
  first_name: string,
  last_name: string,
  email: string,
  address: string,
};

type Props = {
    name: string,
    field: keyof UserDataType,
    value: string,
    handleChange: (field: keyof UserDataType, value: string) => void,
    style?: ViewStyle,
    iconName?: string,
}

export default function InputField({name, style, iconName, field, value, handleChange} : Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{name}</Text>
        <View style={styles.fieldInputArea}>
          <TextInput
            value={value}
            editable
            numberOfLines={1}
            maxLength={40}
            style={styles.textInput}
            onChangeText={text => handleChange(field, text)}
          />
          {iconName && <Ionicons name={`${iconName}-outline` as keyof typeof Ionicons.glyphMap} size={22} style={{opacity: 0.7}} />}
        </View>
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: "#F1F1F1",
    borderRadius: 8,
  },
  fieldLabel: {
    opacity: 0.7,
    fontSize: 13,
    marginBottom: 2,
  },
  fieldInputArea: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 15
  },
});
  