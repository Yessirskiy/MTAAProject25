import { Text, View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useState } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';
import ButtonField from '@/components/ButtonField';
import ToggleSwitchField from '@/components/ToggleSwitchField';
import { updateUserPasswordMe } from '@/api/userApi';
import Toast from 'react-native-toast-message';


const PlaceholderImage = require('@/assets/images/icon.png');
const dangerZoneColor = '#D63E3E';

type UserChangePasswordType = {
  old_password: string,
  new_password1: string,
  new_password2: string
};

const mock_data = {
  old_password: "",
  new_password1: "",
  new_password2: ""
}

export default function ChangePasswordScreen() {
  const [init_data, setInitData] = useState<UserChangePasswordType>(mock_data);
  const [cur_data, setCurData] = useState<UserChangePasswordType>(mock_data);

  const handleChange = (field: keyof typeof cur_data, value: string) => {
    setCurData(prev => ({ ...prev, [field]: value }));
  };

  const data_modified = JSON.stringify(init_data) !== JSON.stringify(cur_data);

  const handleSavePress = async () => {
    try {
      console.log('Call to update User s Password');
      console.log(cur_data);
      const res = await updateUserPasswordMe(cur_data);
      if (res){
        console.log("Return from call:", res);
        setInitData(mock_data);
        setCurData(mock_data);
        Toast.show({
          type: 'success',
          text1:  "Nové heslo bolo úspešne nastavené.",
        });
      }
    } catch (error: any) {
      if (error.response.status == 422){
        console.log("Unprocessable entity supplied.");
        Toast.show({
          type: 'error',
          text1:  'Uistite sa, že sa nové heslá zhodujú a nie sú prázdne'
        });
      } else if (error.response) {
        console.error('HTTP Error:', error.response.status);
        console.error('Error details:', error.response);
  
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
        <InputField<UserChangePasswordType> 
          name="Staré heslo" 
          style={{marginBottom: 10}} 
          field='old_password' 
          value={cur_data.old_password} 
          handleChange={handleChange}
        />
        <InputField<UserChangePasswordType> 
          name="Nové heslo" 
          style={{marginBottom: 10}} 
          field='new_password1' 
          value={cur_data.new_password1} 
          handleChange={handleChange}
        />
        <InputField<UserChangePasswordType> 
          name="Nové heslo (potvrdenie)" 
          style={{marginBottom: 10}} 
          field='new_password2' 
          value={cur_data.new_password2} 
          handleChange={handleChange}
        />
        {data_modified && <ButtonField label="Zmeniť heslo" buttonStyle={{backgroundColor: "#CFCFCF"}} onPress={handleSavePress}/>}
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
