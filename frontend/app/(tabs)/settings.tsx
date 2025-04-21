import { useNavigation } from '@react-navigation/native';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import { useLayoutEffect } from 'react';

const PlaceholderImage = require('@/assets/images/icon.png');
const dangerZoneColor = '#D63E3E';

export default function SettingsScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Nastavenia'
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.subContainer}>
        <SettingsProfilePicture imgSource={PlaceholderImage} style={{marginBottom: 20}}/>
        <SettingsButtonGeneral label="Zmena profilového obrázka" iconName="camera" style={{marginBottom: 20}}/>
        <>
          <SettingsButtonGeneral label="Osobné údaje"  iconName="person" isGroup={true} isFirst={true}/>
          <SettingsButtonGeneral label="Bezpečnosť" iconName="lock-closed" isGroup={true}/>
          <SettingsButtonGeneral label="Notifikácie" iconName="notifications" isGroup={true} isLast={true}/>
        </>
      </View>
      <View style={styles.subContainer}>
        <SettingsButtonGeneral 
          label="Odhlásiť sa"  iconName="exit" 
          isGroup={true} isFirst={true} 
          labelStyle={{color: dangerZoneColor}} iconColor={dangerZoneColor}
        />
        <SettingsButtonGeneral 
          label="Vymazať užívateľský účet" iconName="close-circle" 
          isGroup={true} isLast={true} 
          labelStyle={{color: dangerZoneColor}} iconColor={dangerZoneColor}
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
    //justifyContent: 'space-between',
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
