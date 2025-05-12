import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type Props = {
    imgSource: string,
    imgStyle?: ImageStyle, 
    containerStyle?: ViewStyle,
}

export default function FeedCard({imgSource, imgStyle, containerStyle} : Props) {

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.lightGrey,
      padding: 20,
      flexDirection: 'column',
      justifyContent: 'center',
      borderRadius: 10
    },
    image: {
      width: '100%',
      height: 240,
    }
  });

  return (
    <View style={[styles.container, containerStyle]}>
        <Image source={{uri: imgSource}} style={[styles.image, imgStyle]} />
    </View>
  );
};
