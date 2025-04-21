import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';


const PlaceholderImage = require('@/assets/images/icon.png');
const dangerZoneColor = '#D63E3E';

export default function SettingsProfileScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.subContainer}>
        <SettingsProfilePicture imgSource={PlaceholderImage} style={{marginBottom: 20}}/>
        <InputField name="Meno" style={{marginBottom: 15}}/>
        <InputField name="Priezvisko" style={{marginBottom: 15}}/>
        <InputField name="Email" style={{marginBottom: 15}}/>
        <InputField name="Adresa" style={{marginBottom: 15}}/>
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
  text: {
    color: '#fff',
  },
});
