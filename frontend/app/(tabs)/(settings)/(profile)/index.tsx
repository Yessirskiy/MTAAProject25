import { Text, View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useState, useEffect } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';
import ButtonField from '@/components/ButtonField';
import { getUserMe, getUserPhotoMe, updateUserMe } from '@/api/userApi';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';


const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;
const dangerZoneColor = '#D63E3E';

type UserDataType = {
  first_name: string,
  last_name: string,
  email: string,
  address: string,
};

const mock_data = {
  first_name: '',
  last_name: '',
  email: '',
  address: ''
}

export default function SettingsProfileScreen() {
  const [profilePic, setProfilePic] = useState<string>(PlaceholderImage);
  const [init_data, setInitData] = useState<UserDataType>(mock_data);
  const [cur_data, setCurData] = useState<UserDataType>(mock_data);

  const handleChange = (field: keyof typeof cur_data, value: string) => {
    setCurData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserMe();
        setInitData(data); 
        setCurData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchImage = async () => {
      const response = await getUserPhotoMe();
      if (response.status == 204){
        setProfilePic(PlaceholderImage);
        return;
      }
      const blob = await response.data;
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(blob);
    };

    fetchData();
    fetchImage();
  }, []);

  const data_modified = JSON.stringify(init_data) !== JSON.stringify(cur_data);

  const handlePress = async () => {
    try {
      // Your async logic here
      console.log('Call to update User s Profile');
      console.log(cur_data);
      const res = await updateUserMe(cur_data);
      if (res){
        console.log("Return from call:", res);
        setInitData(res);
        setCurData(res);
        Toast.show({
          type: 'success',
          text1:  "Profil bol aktualizovaný",
        });
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.subContainer}>
        <SettingsProfilePicture imgSource={profilePic} style={{marginBottom: 20}}/>
        <ButtonField label="Zmena profilového obrázka" onPress={() => router.push('./changeProfilePicture')}/>
        <InputField<UserDataType> name="Meno" style={{marginBottom: 15}} field='first_name' value={cur_data.first_name} handleChange={handleChange}/>
        <InputField<UserDataType> name="Priezvisko" style={{marginBottom: 15}} field='last_name' value={cur_data.last_name} handleChange={handleChange}/>
        <InputField<UserDataType> name="Email" style={{marginBottom: 15}} field='email' value={cur_data.email} handleChange={handleChange}/>
        <InputField<UserDataType> name="Adresa" style={{marginBottom: 15}}  field='address' value={cur_data.address} handleChange={handleChange} iconName='map'/>
        {data_modified && <ButtonField label="Uložiť" buttonStyle={{backgroundColor: "#CFCFCF"}} onPress={handlePress}/>}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    alignItems: 'center',

  },
  subContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: "#F1F1F1",
    borderRadius: 5,
  },
  buttonLabel: {
    width: '100%',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 2,
  },
  text: {
    color: '#fff',
  },
});
