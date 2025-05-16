import { StyleSheet, View, Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type Props = {
  label: string,
  style?: ViewStyle,
  buttonStyle?: ViewStyle,
  labelStyle?: TextStyle,
  iconName?: string,
  onPress?: (...args: any[]) => void
}

export default function CredentialButton({label, style, buttonStyle, labelStyle, iconName, onPress} : Props) {
  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: 55,
      paddingHorizontal: 15,
      alignItems: 'center'
    },
    fieldContainer: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
      width: '60%'
    },
    fieldLabel: {
      opacity: 0.9,
      fontSize: isAccessibilityMode ? 16 * 1.25 : 16,
      marginBottom: 2,
      color: colors.textPrimary
    }
  });

  return (
    <View style={[styles.container, style]}>
      <Pressable style={[styles.fieldContainer, buttonStyle]} onPress={onPress}>
        {iconName && <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={22} style={{opacity: 0.7, marginRight: 10, color: colors.textPrimary}} />}
        <Text style={[styles.fieldLabel, labelStyle]}>{label}</Text>
      </Pressable>
    </View>
  );
};
