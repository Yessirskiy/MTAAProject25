import { Text, View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useState } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';
import ButtonField from '@/components/ButtonField';


const PlaceholderImage = require('@/assets/images/icon.png');
const dangerZoneColor = '#D63E3E';

type UserDataType = {
  first_name: string,
  last_name: string,
  email: string,
  address: string,
};

const mock_data = {
  first_name: 'Jakub',
  last_name: 'Meliga',
  email: 'example@gmail.com',
  address: 'Illkovicova 2, Bratislava'
}

export default function SettingsProfileScreen() {
  const [init_data] = useState<UserDataType>(mock_data);
  const [cur_data, setCurData] = useState<UserDataType>(mock_data);

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
        <SettingsProfilePicture imgSource={PlaceholderImage} style={{marginBottom: 20}}/>
        <ButtonField label="Zmena profilového obrázka"/>
        <InputField<UserDataType> name="Meno" style={{marginBottom: 15}} field='first_name' value={cur_data.first_name} handleChange={handleChange}/>
        <InputField<UserDataType> name="Priezvisko" style={{marginBottom: 15}} field='last_name' value={cur_data.last_name} handleChange={handleChange}/>
        <InputField<UserDataType> name="Email" style={{marginBottom: 15}} field='email' value={cur_data.email} handleChange={handleChange}/>
        <InputField<UserDataType> name="Adresa" style={{marginBottom: 15}}  field='address' value={cur_data.address} handleChange={handleChange} iconName='map'/>
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
