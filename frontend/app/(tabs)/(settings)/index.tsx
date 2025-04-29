import { Text, View, StyleSheet, ScrollView } from 'react-native';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';

const PlaceholderImage = require('@/assets/images/icon.png');
const dangerZoneColor = '#D63E3E';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.subContainer}>
        <SettingsProfilePicture imgSource={PlaceholderImage} style={{marginBottom: 20}}/>
        <SettingsButtonGeneral label="Zmena profilového obrázka" dest='./settings/profile' iconName="camera" style={{marginBottom: 20}}/>
        <>
          <SettingsButtonGeneral label="Osobné údaje" dest='./(settings)/profile' iconName="person" isGroup={true} isFirst={true}/>
          <SettingsButtonGeneral label="Bezpečnosť" dest='./(settings)/(security)' iconName="lock-closed" isGroup={true}/>
          <SettingsButtonGeneral label="Notifikácie" dest='./settings/profile' iconName="notifications" isGroup={true} isLast={true}/>
        </>
      </View>
      <View style={styles.subContainer}>
        <SettingsButtonGeneral 
          label="Odhlásiť sa"  iconName="exit" dest='./settings/profile'
          isGroup={true} isFirst={true} 
          labelStyle={{color: dangerZoneColor}} iconColor={dangerZoneColor}
        />
        <SettingsButtonGeneral 
          label="Vymazať užívateľský účet" iconName="close-circle" dest='./settings/profile'
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
