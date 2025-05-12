import { Text, View, StyleSheet, ScrollView, Image, RefreshControl  } from 'react-native';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { router, useRouter } from 'expo-router';
import { getUserPhotoMe } from '@/api/userApi';

const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;
const dangerZoneColor = '#D63E3E';

export default function SettingsScreen() {
  const [profilePic, setProfilePic] = useState<string>(PlaceholderImage);
  const [refreshing, setRefreshing] = useState(false);

  const router1 = useRouter();
  const auth = useContext(AuthContext);
  const { logout } = auth;

  const user = useProtectedRoute();
  if (!user) return null;

  const handleLogoutPress = async () => {
    await logout();
    router1.replace("/signin");
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

  useEffect(() => {
    fetchImage();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchImage();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.subContainer}>
        <SettingsProfilePicture imgSource={profilePic} style={{marginBottom: 20}}/>
        <SettingsButtonGeneral label="Zmena profilového obrázka" onPress={() => router.push('./(settings)/(profile)')} iconName="camera" style={{marginBottom: 20}}/>
        <>
          <SettingsButtonGeneral label="Osobné údaje" onPress={() =>  router.push('./(settings)/(profile)')} iconName="person" isGroup={true} isFirst={true}/>
          <SettingsButtonGeneral label="Bezpečnosť" onPress={() => router.push('./(settings)/(security)')} iconName="lock-closed" isGroup={true}/>
          <SettingsButtonGeneral label="Notifikácie" onPress={() => router.push('./(settings)/notifications')} iconName="notifications" isGroup={true} isLast={true}/>
        </>
      </View>
      <View style={styles.subContainer}>
        <SettingsButtonGeneral 
          label="Odhlásiť sa"  iconName="exit" onPress={handleLogoutPress}
          isGroup={true} isFirst={true} 
          labelStyle={{color: dangerZoneColor}} iconColor={dangerZoneColor}
        />
        <SettingsButtonGeneral 
          label="Vymazať užívateľský účet" iconName="close-circle" onPress={() => router.push('./(settings)/(profile)')}
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
