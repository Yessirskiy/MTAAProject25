import { StyleSheet, View, Text, TextInput, ViewStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type Props = {
    label: string,
    style?: ViewStyle,
    iconName?: string,
    onPress?: any;
}

export default function ReactionButton({label, style, iconName} : Props) {

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const styles = StyleSheet.create({
    container: {
      height: 'auto',
      flex: 1,
    },
    button: {
      backgroundColor: colors.border,
      paddingVertical: isAccessibilityMode ? 12 * 1.25 : 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8
    },
    buttonLabel: {
      fontSize: isAccessibilityMode ? 13 * 1.25 : 13,
      lineHeight: 17,
      marginRight: 2,
      color: colors.textPrimary,
    },
    buttonIcon: {
      opacity: 0.7,
    }
  });

  return (
    <View style={[styles.container, style]}>
        <Pressable style={styles.button}>
            <Text style={[styles.buttonLabel]}>{label}</Text>
            <Ionicons name={`${iconName}-outline` as keyof typeof Ionicons.glyphMap} size={22} style={styles.buttonIcon} />
        </Pressable>
    </View>
  );
};
