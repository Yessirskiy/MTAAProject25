import { StyleSheet, View, Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type Props = {
  label: string,
  style?: ViewStyle,
  buttonStyle?: ViewStyle,
  labelStyle?: TextStyle,
  onPress?: (...args: any[]) => void,
  disabled?: boolean
}

export default function ButtonField({label, style, buttonStyle, labelStyle, onPress, disabled=false} : Props) {
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
      paddingHorizontal: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
    },
    fieldLabel: {
      opacity: 0.9,
      fontSize: isAccessibilityMode ? 16 * 1.25 : 16,
      marginBottom: 2,
      color: colors.textPrimary,
    }
  });

  return (
    <View style={[styles.container, style]}>
      <Pressable style={[styles.fieldContainer, buttonStyle]} onPress={onPress} disabled={disabled}>
        <Text style={[styles.fieldLabel, labelStyle]}>{label}</Text>
      </Pressable>
    </View>
  );
};
  