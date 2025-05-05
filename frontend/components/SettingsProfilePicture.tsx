import { ImageStyle, StyleSheet } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

type Props = {
  imgSource: string;
  style?: ImageStyle;
};

export default function SettingsProfilePicture({ imgSource, style }: Props) {
  return <Image source={{uri: imgSource}} style={[styles.image, style]} />;
}

const styles = StyleSheet.create({
  image: {
    width: "50%",
    aspectRatio: 1,
    borderRadius: 10,
  },
});
