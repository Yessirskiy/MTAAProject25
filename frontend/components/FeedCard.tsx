import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle, ImageStyle, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Image } from 'react-native';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import type { Report, ReportUser, ReportAddress } from '@/types/report';
import ReactionButton from './ReactionButton';
import { useEffect, useState } from 'react';
import { createVote, deleteVote, getVote, updateVote } from '@/api/voteApi';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Toast from 'react-native-toast-message';
import { getReportPhoto, getReportPhotoBlob } from '@/api/reportApi';

const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;

type Props = {
  report: Report,
  imgStyle?: ImageStyle, 
  containerStyle?: ViewStyle,
  onHandlePress: () => void;
  reactions?: boolean
}

export default function FeedCard({ report, imgStyle, containerStyle, onHandlePress, reactions = true } : Props) {
  const user = useProtectedRoute();
  const [vote, setVote] = useState<boolean | null>(null);
  const [imageUri, setImageUri] = useState(PlaceholderImage);
  
  const onReactionPress = async (value: boolean) => {
    try {
      if (vote == null) {
        const res = await createVote(Number(user != null ? user.id : 0), report.id, value);
        if (res.data) {
          setVote(res.data.is_positive);
        }
      } else {
        if (vote === value) {
          const res = await deleteVote(Number(user != null ? user.id : 0), report.id);
          if (res.status === 200){
            setVote(null);
          }
        } else {
          const res = await updateVote(Number(user != null ? user.id : 0), report.id, value);
          if (res.data){
            setVote(res.data.is_positive);
          }
        }
      }
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const isStringDetail = typeof detail === 'string';
      if (error.response) {
        if (error.response.status === 404){
          console.log("No vote for the feed & user")
          setVote(null);
        }
        console.error('HTTP Error:', error.response.status);
        console.error('Error details:', error.response.data);
        Toast.show({
          type: 'error',
          text1:  isStringDetail ? detail : 'An error occurred',
          text2: `Return code: ${error.response.status}`
        });
      } else if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`
        });
      } else {
        console.log(error);
        Toast.show({
          type: 'error',
          text1: 'Unknown error.'
        });
      }
    }
  };

  const fetchVote = async () => {
    try {
      const res = await getVote(Number(user ? user.id : 0), report.id);
      if (res.data) {
        setVote(res.data.is_positive);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404){
          console.log("No vote for the feed & user")
          setVote(null);
        } else {
          console.error('HTTP Error:', error.response.status);
          console.error('Error details:', error.response.data);
          Toast.show({
            type: 'error',
            text1:  error.response.data.detail,
            text2: `Return code: ${error.response.status}`
          });
        }
      } else if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`
        });
      } else {
        console.log(error);
        Toast.show({
          type: 'error',
          text1: 'Unknown error.'
        });
      }
    }
  };

  const fetchImage = async () => {
    try {
      const res = await getReportPhotoBlob(report.photos[0].id);
      console.log(res.status);
      if (res.status == 204){
        setImageUri(PlaceholderImage);
      } else {
        const blob = await res.data;
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUri(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }
      
    } catch (error: any) {
      console.log("HERE");
      if (error.response) {
        if (error.response.status === 404){
          console.log("No vote for the feed & user")
          setVote(null);
        } else {
          console.error('HTTP Error:', error.response.status);
          console.error('Error details:', error.response.data);
          Toast.show({
            type: 'error',
            text1:  error.response.data.detail,
            text2: `Return code: ${error.response.status}`
          });
        }
        
      } else if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`
        });
      } else {
        console.log(error);
        Toast.show({
          type: 'error',
          text1: 'Unknown error.'
        });
      }
    }
  };

  useEffect(() => {
    fetchVote();
    fetchImage();
  }, []);

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
      marginBottom: 1,
      color: colors.textPrimary,
    },
    addressText: {
      fontSize: isAccessibilityMode ? 13 * 1.25 : 13,
      lineHeight: 17,
      opacity: 0.7,
      marginBottom: 1,
      color: colors.textPrimary,
    },
    reporterText: {
      fontSize: isAccessibilityMode ? 11 * 1.25 : 11,
      lineHeight: 15,
      opacity: 0.6,
      marginBottom: 9,
      color: colors.textPrimary,
    },
    reactionsContainer: {
      backgroundColor: isDarkMode ? "#2F2F2F" : "#E9E9E9", 
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
      color: colors.textPrimary,
    }
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity onPress={onHandlePress}>
      <ExpoImage source={{uri: imageUri}} style={[styles.image, imgStyle]} />
      <Text style={styles.noteText}>{report.note}</Text>
      <Text style={styles.addressText}>
        {report.address.street + " " + report.address?.building + ", " + report.address?.postal_code}
      </Text>
      <View>
        <Text style={styles.reporterText}>{report.user.first_name} {report.user.last_name}</Text>
      </View>
      {reactions && <View style={styles.reactionsContainer}>
        <Text style={styles.reactionsLabel}>Videli ste to?</Text>
        <View style={styles.reactionsSubcontainer}>
          <ReactionButton 
            label="Áno, je to tak" 
            pressed={vote != null ? vote : false} 
            iconName='arrow-up' 
            style={{alignSelf: "stretch"}}
            onPress={() => onReactionPress(true)}
          />
          <ReactionButton 
            label="Nie, nie je to tak" 
            pressed={vote != null ? !vote : false} 
            iconName='arrow-down' 
            style={{alignSelf: "stretch"}}
            onPress={() => onReactionPress(false)}
          />
        </View>
      </View>}
      </TouchableOpacity>
    </View>
  );
};
