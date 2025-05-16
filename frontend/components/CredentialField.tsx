import { StyleSheet, View, Pressable, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type Props<T> = {
    name: string,
    field: keyof T,
    value: string,
    handleChange: (field: keyof T, value: string) => void,
    placeholder?: string
    style?: ViewStyle,
    iconName?: string,
}

export default function CredentialField<T>({name, style, iconName, field, placeholder, value, handleChange} : Props<T>) {
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
      paddingVertical: 10,
      paddingHorizontal: 10,
      justifyContent: 'center',
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
    },
    fieldInputArea: {
      flexDirection: 'row',
      marginBottom: 2
    },
    verticalBar: {
      width: StyleSheet.hairlineWidth,
      height: "100%", 
      backgroundColor: colors.textPrimary, 
      marginHorizontal: 10,
    },
    textInput: {
      flex: 1,
      fontSize: isAccessibilityMode ? 15 * 1.25 : 15,
      color: colors.textPrimary,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.fieldContainer}>
        <View style={styles.fieldInputArea}>
          {iconName && <Ionicons name={`${iconName}-outline` as keyof typeof Ionicons.glyphMap} size={22} style={{opacity: 0.6, color: colors.textPrimary}} />}
          {iconName && <View style={styles.verticalBar} />}
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="grey"
            value={value}
            editable
            numberOfLines={1}
            maxLength={40}
            style={styles.textInput}
            onChangeText={text => handleChange(field, text)}
          />
        </View>
      </View>
    </View>
  );
};
  