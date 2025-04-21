import { StyleSheet, View, Pressable, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, RelativePathString } from 'expo-router';
import { useState } from 'react';

type Props = {
    name: string,
    style?: ViewStyle,
}

export default function InputField({name, style} : Props) {
  const [value, setValue] = useState('Jakub');

  const handleChange = (val: string) => {
    setValue(val);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{name}</Text>
        <TextInput
          editable
          numberOfLines={1}
          maxLength={40}
          style={styles.textInput}
          onChangeText={text => handleChange(text)}
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: "#F1F1F1",
    borderRadius: 5,
  },
  fieldLabel: {
    opacity: 0.7,
    fontSize: 13,
    marginBottom: 2,
  },
  textInput: {
    width: '100%',
    fontSize: 15,
    marginBottom: 2,
  },
});
  