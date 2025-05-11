import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    upperText: string,
    statisticText: string,
    bottomText: string,
    containerStyle?: ViewStyle,
    statisticStyle?: TextStyle,
}

export default function HomeStatisticsBox({upperText, statisticText, bottomText, containerStyle, statisticStyle} : Props) {
  return (
    <View style={[styles.container, containerStyle]}>
        <Text style={[styles.upperTextStyle]}>{upperText}</Text>
        <Text style={[styles.statisticTextStyle, statisticStyle]}>{statisticText}</Text>
        <Text style={styles.bottomTextStyle}>{bottomText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 10
  },
  upperTextStyle: {
    marginHorizontal: 10,
    textAlign: 'center',
    fontSize: 18
  },
  statisticTextStyle: {
    textAlign: 'center',
    fontSize: 48
  },
  bottomTextStyle: {
    marginHorizontal: 18,
    textAlign: 'center',
    fontSize: 18
  }
});
  