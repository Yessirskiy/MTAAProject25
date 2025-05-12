import { Text, View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';
import ButtonField from '@/components/ButtonField';
import { getUserAddressMe, getUserMe, getUserPhotoMe, updateUserAddressMe, updateUserMe } from '@/api/userApi';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import TempAddressInputField from '@/components/TempAddressInputField';
import MapPicker from '@/components/MapPicker';
import TempMapPicker from '@/components/TempMapPicker';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;
const dangerZoneColor = '#D63E3E';

type UserDataType = {
  first_name: string,
  last_name: string,
  email: string,
  address: string,
};

type AddressDataType = {
  building: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
}

const mock_user_data = {
  first_name: '',
  last_name: '',
  email: '',
  address: ''
}

const mock_address_data = {
  building: '',
  street: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  latitude: 0,
  longitude: 0,
}

export default function SettingsProfileScreen() {
  const [profilePic, setProfilePic] = useState<string>(PlaceholderImage);
  const [init_data, setInitData] = useState<UserDataType>(mock_user_data);
  const [cur_data, setCurData] = useState<UserDataType>(mock_user_data);

  const [address_init, setAddressInit] = useState<AddressDataType>(mock_address_data);
  const [address, setAddress] = useState<AddressDataType>(mock_address_data);
  const [addressStr, setAddressStr] = useState<string>("")
  
  const [activeView, setActiveView] = useState<'main' | 'map'>('main');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const searchRef = useRef<any>(null);

  const handleChange = (field: keyof typeof cur_data, value: string) => {
    setCurData(prev => ({ ...prev, [field]: value }));
  };

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserMe();
        setInitData(data); 
        setCurData(data);
        const addr = await getUserAddressMe();
        setAddressInit(addr.data);
        setAddress(addr.data);
        setAddressStr(addr.data.street + ", " + addr.data.postal_code);
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
  const address_modified = JSON.stringify(address_init) !== JSON.stringify(address);

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
      }
      console.log('Call to update User s Address');
      console.log(address);
      const res1 = await updateUserAddressMe(address);
      if (res1){
        console.log("Return from call:", res1);
        setAddressInit(res1.data);
        setAddress(res1.data);
      }
      if (res && res1){
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


  if (activeView === 'map') {
    return (
      <TempMapPicker
        onLocationPicked={(locationData) => {
          setAddress(locationData);
          setCoords({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          });
          setAddressStr(locationData.street + ", " + locationData.postal_code);
          searchRef.current?.setAddressText(addressStr);
        }}
        goBack={() => setActiveView('main')}
      />
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 10,
      alignItems: 'center',

    },
    subContainer: {
      width: '100%',
      backgroundColor: colors.background,
      alignItems: 'center',
      marginBottom: 20,
    },
    button: {
      width: '100%',
      paddingVertical: 8,
      marginHorizontal: 10,
      justifyContent: 'center',
      backgroundColor: colors.lightGrey,
      borderRadius: 5,
    },
    buttonLabel: {
      width: '100%',
      fontSize: isAccessibilityMode ? 16 * 1.25 : 16,
      opacity: 0.9,
      marginBottom: 2,
    },
    text: {
      color: colors.background,
    },
  });

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
        <TempAddressInputField 
          name="Adresa" 
          iconName='map'
          address={addressStr}
          setAddress={setAddressStr}
          setCoords={setCoords}
          onMapPress={() => setActiveView('map')}
          style={{marginBottom: 20}}
        />
        {(data_modified || address_modified) && <ButtonField label="Uložiť" buttonStyle={{backgroundColor: colors.border}} onPress={handlePress}/>}
      </View>
      </ScrollView>
    </View>
  );
}
