import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle, ImageStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { Report, ReportUser, ReportAddress } from '@/types/report';
import ReactionButton from './ReactionButton';


type Props = {
    imgSource: string,
    report: Report,
    imgStyle?: ImageStyle, 
    containerStyle?: ViewStyle,
}

export default function FeedCard({imgSource, report, imgStyle, containerStyle} : Props) {
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F1F1',
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
    fontSize: 15,
    lineHeight: 17,
    opacity: 0.9,
    marginBottom: 1
  },
  addressText: {
    fontSize: 13,
    lineHeight: 17,
    opacity: 0.7,
    marginBottom: 1
  },
  reporterText: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.6,
    marginBottom: 9
  },
  reactionsContainer: {
    backgroundColor: "#E9E9E9",
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
    fontSize: 13,
    lineHeight: 15,
    opacity: 0.7,
    marginBottom: 7,
  }
})