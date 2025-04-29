import { Text, View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useState } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';
import ButtonField from '@/components/ButtonField';
import ToggleSwitchField from '@/components/ToggleSwitchField';


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
  const [init_data] = useState<UserChangePasswordType>(mock_data);
  const [cur_data, setCurData] = useState<UserChangePasswordType>(mock_data);

  const handleChange = (field: keyof typeof cur_data, value: string) => {
    setCurData(prev => ({ ...prev, [field]: value }));
  };

  const data_modified = JSON.stringify(init_data) !== JSON.stringify(cur_data);

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
        {data_modified && <ButtonField label="Uložiť" buttonStyle={{backgroundColor: "#CFCFCF"}}/>}
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
