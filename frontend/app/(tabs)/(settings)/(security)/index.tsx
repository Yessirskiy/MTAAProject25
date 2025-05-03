import { Text, View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useState, useEffect } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';
import ButtonField from '@/components/ButtonField';
import ToggleSwitchField from '@/components/ToggleSwitchField';
import { router } from 'expo-router';
import { getUserSettingsMe, updateUserSettingsMe } from '@/api/userApi';
import Toast from 'react-native-toast-message';


const PlaceholderImage = require('@/assets/images/icon.png');
const dangerZoneColor = '#D63E3E';

type UserSecurityType = {
  is_name_hidden: boolean,
  is_phone_hidden: boolean,
  is_email_hidden: boolean,
  is_picture_hidden: boolean
};

const mock_data = {
  is_name_hidden: false,
  is_phone_hidden: false,
  is_email_hidden: false,
  is_picture_hidden: false
}


export default function SecurityScreen() {
  const [init_data, setInitData] = useState<UserSecurityType>(mock_data);
  const [cur_data, setCurData] = useState<UserSecurityType>(mock_data);

  const handleChange = (field: keyof typeof cur_data, value: boolean) => {
    setCurData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserSettingsMe();
        setInitData(data); 
        setCurData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();

  }, []);

  const data_modified = JSON.stringify(init_data) !== JSON.stringify(cur_data);

  const handleSavePress = async () => {
    try {
      // Your async logic here
      console.log('Call to update User s Settings');
      console.log(cur_data);
      const res = await updateUserSettingsMe(cur_data);
      if (res){
        console.log("Return from call:", res);
        setInitData(res);
        setCurData(res);
        Toast.show({
          type: 'success',
          text1:  "Bezpečnostné nastavenia boli uložené.",
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
        <Text style={styles.groupLabel}>Súkromie</Text>
        <ToggleSwitchField<UserSecurityType>
          name="Skryť moje meno a priezvisko" 
          field='is_name_hidden' 
          value={cur_data.is_name_hidden} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
        />
        <ToggleSwitchField<UserSecurityType> 
          name="Skryť moje telefóne číslo" 
          field='is_phone_hidden' 
          value={cur_data.is_phone_hidden} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
        />
        <ToggleSwitchField<UserSecurityType> 
          name="Skryť moj email" 
          field='is_email_hidden' 
          value={cur_data.is_email_hidden} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
        />
        <ToggleSwitchField<UserSecurityType> 
          name="Skryť profilovú fotografiu" 
          field='is_picture_hidden' 
          value={cur_data.is_picture_hidden} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
        />
        {data_modified && <ButtonField label="Uložiť" buttonStyle={{backgroundColor: "#CFCFCF"}} onPress={handleSavePress}/>}
        <Text style={styles.groupLabel}>Prihlasovanie</Text>
        <ButtonField 
          label="Zmena hesla" 
          buttonStyle={{height: '100%', alignItems: 'flex-start'}} 
          style={{marginBottom: 10}}
          onPress={() => router.push("/(tabs)/(settings)/(security)/changePassword")}
        />
        <ButtonField 
          label="Odhlásenie z každého zariadenia" 
          buttonStyle={{
            height: '100%', 
            alignItems: 'flex-start'
          }}
          labelStyle={{color: dangerZoneColor}}
        />
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
  groupLabel: {
    alignSelf: 'flex-start', 
    marginLeft: 18, 
    marginBottom: 7,
    fontSize: 14,
    opacity: 0.7
  }
});
