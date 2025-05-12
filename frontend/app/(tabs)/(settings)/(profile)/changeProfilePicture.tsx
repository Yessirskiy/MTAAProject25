import React, { useState, useEffect } from 'react';
import { Button, Image, View, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import ButtonField from '@/components/ButtonField';
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import { deleteUserPhotoMe, getUserPhotoMe, updateUserPhotoMe } from '@/api/userApi';
import Toast from 'react-native-toast-message';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;
const dangerZoneColor = '#D63E3E';



export default function PhotoPickerScreen() {
  const [imageUri, setImageUri] = useState<string>(PlaceholderImage);
  const [imageSelected, setImageSelected] = useState<boolean>(false);

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);

  const fetchImage = async () => {
    setImageUri(PlaceholderImage);
    setImageSelected(false);
    const response = await getUserPhotoMe();
    if (response.status == 204)
      return;
    const blob = await response.data;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUri(reader.result as string);
    };
    reader.readAsDataURL(blob);
  };

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to allow access to photos to use this feature.');
      }
    })();
    fetchImage();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }

    setImageSelected(true);
  };

  const onSavePress = async () => {
    try {
      const res = await updateUserPhotoMe({
        uri: imageUri
      });
      if (res.status == 200){
        Toast.show({
          type: 'success',
          text1:  "Nový profilový obrázok je nastavený",
        });
        setImageSelected(false);
      }
    } catch (error: any) {
      if (error.response) {
        console.error('HTTP Error:', error.response.status);
        console.error('Error details:', error.response.data);
  
        Toast.show({
          type: 'error',
          text1:  error.response.data.detail,
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

  const onCancelPress = async () => {
    await fetchImage();
  }

  const onDeletePress = async () => {
    try {
      const res = await deleteUserPhotoMe();
      if (res.status == 200){
        Toast.show({
          type: 'success',
          text1:  "Profilový obrázok bol odstránený",
        });
        setImageUri(PlaceholderImage);
        setImageSelected(false);
      }
    } catch (error: any) {
      if (error.response) {
        console.error('HTTP Error:', error.response.status);
        console.error('Error details:', error.response.data);
  
        Toast.show({
          type: 'error',
          text1:  error.response.data.detail,
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
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.background
    },
    imageContainer: {
      alignItems: 'center',
      marginHorizontal: 15
    },
    image: {
      marginTop: 20,
      width: 200,
      height: 200,
      borderRadius: 10,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <SettingsProfilePicture imgSource={imageUri} style={{marginBottom: 20, width: '100%'}}/>
      </View>
      {!imageSelected && <ButtonField label="Zmena profilového obrázka" onPress={pickImage}/>}
      {imageSelected && <ButtonField label="Uložiť" onPress={onSavePress} />}
      {imageSelected && <ButtonField label="Zrušiť" onPress={onCancelPress}/>}
      <ButtonField 
        label="Odstránenie profilového obrázku" 
        labelStyle={{color: dangerZoneColor}} 
        style={{marginTop: 'auto'}}
        onPress={onDeletePress}
      />
    </View>
  );
}
