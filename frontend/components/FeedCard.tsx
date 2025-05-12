import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle, ImageStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import type { Report, ReportUser, ReportAddress } from '@/types/report';
import ReactionButton from './ReactionButton';


type Props = {
    imgSource: string,
    report: Report,
    imgStyle?: ImageStyle, 
    containerStyle?: ViewStyle,
}

export default function FeedCard({imgSource, report, imgStyle, containerStyle} : Props) {

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.lightGrey,
      padding: 15,
      flexDirection: 'column',
      justifyContent: 'center',
      borderRadius: 10,
      marginBottom: 20,
    },
    image: {
      width: '100%',
      height: 240,
      marginBottom: 9,
      borderRadius: 5
    },
    noteText: {
      fontSize: isAccessibilityMode ? 15 * 1.25 : 15,
      lineHeight: 17,
      opacity: 0.9,
      marginBottom: 1
    },
    addressText: {
      fontSize: isAccessibilityMode ? 13 * 1.25 : 13,
      lineHeight: 17,
      opacity: 0.7,
      marginBottom: 1
    },
    reporterText: {
      fontSize: isAccessibilityMode ? 11 * 1.25 : 11,
      lineHeight: 15,
      opacity: 0.6,
      marginBottom: 9
    },
    reactionsContainer: {
      backgroundColor: colors.buttonBackground,
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingTop: 7,
      paddingBottom: 10,
    },
    reactionsSubcontainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 15
    },
    reactionsLabel: {
      fontSize: isAccessibilityMode ? 13 * 1.25 : 13,
      lineHeight: 15,
      opacity: 0.7,
      marginBottom: 7,
    }
  });

  return (
    <View style={[styles.container, containerStyle]}>
        <Image source={{uri: imgSource}} style={[styles.image, imgStyle]} />
        <Text style={styles.noteText}>{report.note}</Text>
        <Text style={styles.addressText}>
          {report.address.street + " " + report.address?.building + ", " + report.address?.postal_code}
        </Text>
        <View>
          <Text style={styles.reporterText}>{report.user.first_name} {report.user.last_name}</Text>
        </View>
        <View style={styles.reactionsContainer}>
          <Text style={styles.reactionsLabel}>Videli ste to?</Text>
          <View style={styles.reactionsSubcontainer}>
            <ReactionButton label="Áno, je to tak" iconName='arrow-up' style={{alignSelf: "stretch"}}/>
            <ReactionButton label="Nie, to tak nie je" iconName='arrow-down' style={{alignSelf: "stretch"}}/>
          </View>
        </View>
    </View>
  );
};
