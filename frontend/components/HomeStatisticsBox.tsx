import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type Props = {
    upperText: string,
    statisticText: string,
    bottomText: string,
    containerStyle?: ViewStyle,
    statisticStyle?: TextStyle,
}

export default function HomeStatisticsBox({upperText, statisticText, bottomText, containerStyle, statisticStyle} : Props) {
  
  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.lightGrey,
      padding: 10,
      flexDirection: 'column',
      justifyContent: 'center',
      borderRadius: 10
    },
    upperTextStyle: {
      marginHorizontal: 10,
      textAlign: 'center',
      fontSize: 18,
      color: colors.textPrimary,
    },
    statisticTextStyle: {
      textAlign: 'center',
      fontSize: 48,
      color: colors.textPrimary,
    },
    bottomTextStyle: {
      marginHorizontal: 18,
      textAlign: 'center',
      fontSize: 18,
      color: colors.textPrimary,
    }
  });

  return (
    <View style={[styles.container, containerStyle]}>
        <Text style={[styles.upperTextStyle]}>{upperText}</Text>
        <Text style={[styles.statisticTextStyle, statisticStyle]}>{statisticText}</Text>
        <Text style={styles.bottomTextStyle}>{bottomText}</Text>
    </View>
  );
};

  