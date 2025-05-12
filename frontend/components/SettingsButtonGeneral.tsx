import { StyleSheet, View, Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type Props = {
  label: string;
  iconName: string;
  isFirst?: boolean;
  isLast?: boolean;
  isGroup?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  iconColor?: string;
  onPress?: any;
};

export default function SettingsButtonGeneral({ label, iconName, style, labelStyle, onPress, iconColor = "black", isFirst = false, isLast = false, isGroup = false }: Props) {

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const styles = StyleSheet.create({
    buttonContainer: {
      width: '100%',
      height: 40,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      borderRadius: 8,
      paddingHorizontal: 15,
      width: '100%',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      backgroundColor: colors.lightGrey,
    },
    divider: {
      width: '95%', 
      height: StyleSheet.hairlineWidth, 
      backgroundColor: colors.textPrimary, 
      opacity: 0.9
    },
    buttonLabel: {
      color: colors.textPrimary,
      fontSize: isAccessibilityMode ? 16 * 1.25 : 16,
      opacity: 0.9,
    },
  });

  return (
    <View style={[styles.buttonContainer, style]}>
      <Pressable 
        style={[
          styles.button, 
          isGroup ? {
            borderTopLeftRadius: (isFirst ? 8 : 0),
            borderTopRightRadius: (isFirst ? 8 : 0),
            borderBottomLeftRadius: (isLast ? 8 : 0),
            borderBottomRightRadius: (isLast ? 8 : 0),
          } : {borderRadius: 8},
        ]} 
        onPress={onPress}
      >
        <Text style={[styles.buttonLabel, labelStyle]}>{label}</Text>
        <Ionicons name={`${iconName}-outline` as keyof typeof Ionicons.glyphMap} size={22} color={iconColor} style={{opacity: 0.7}} />
      </Pressable>
      {(isGroup && !isLast) && 
        <View style={{backgroundColor: colors.lightGrey, width: '100%', alignItems: 'center'}}>
          <View style={styles.divider}/>
        </View>}
    </View>
  );
}
// {isGroup && <View style={{ width: '95%', height: 1, backgroundColor: '#000000', opacity: 0.9}} />}
