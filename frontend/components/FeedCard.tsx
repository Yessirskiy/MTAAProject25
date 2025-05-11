import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

type Props = {
    imgSource: string,
    imgStyle?: ImageStyle, 
    containerStyle?: ViewStyle,
}

export default function FeedCard({imgSource, imgStyle, containerStyle} : Props) {
  return (
    <View style={[styles.container, containerStyle]}>
        <Image source={{uri: imgSource}} style={[styles.image, imgStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F1F1',
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 10
  },
  image: {
    width: '100%',
    height: 240,
  }
})