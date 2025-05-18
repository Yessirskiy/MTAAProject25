import { Text, View, StyleSheet, ScrollView, Image, RefreshControl, Modal, TouchableOpacity  } from 'react-native';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { router, useRouter } from 'expo-router';
import { getUserPhotoMe } from '@/api/userApi';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import { deleteUserMe } from '@/api/userApi';
import Toast from 'react-native-toast-message';


const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;
const dangerZoneColor = '#D63E3E';

export default function SettingsScreen() {
  const [profilePic, setProfilePic] = useState<string>(PlaceholderImage);
  const [refreshing, setRefreshing] = useState(false);

  const router1 = useRouter();
  const auth = useContext(AuthContext);
  const { logout } = auth;

  const handleLogoutPress = async () => {
    await logout();
    router1.replace("/signin");
  };

  const { isDarkMode, toggleDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode, toggleAccessibility } = UseTheme();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchImage = async () => {
    const response = await getUserPhotoMe();
    if (response.status == 204){
      setProfilePic(PlaceholderImage);
    } else {
      const blob = await response.data;
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(blob);
    }
  };

  useEffect(() => {
    fetchImage();
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUserMe();
      Toast.show({
        type: 'success',
        text1: 'Úspech',
        text2: 'Váš účet bol úspešne vymazaný.'
      });
      router1.replace("/signin");
    } catch (error: any) {
      if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`
        });
      }
      else {
        console.error('Error', error);
      }
    }
    setDeleting(false);
    setShowDeleteDialog(false);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchImage();
    setRefreshing(false);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 10,
      //justifyContent: 'space-between',
      alignItems: 'center',

    },
    subContainer: {
      width: '100%',
      backgroundColor: colors.background,
      alignItems: 'center',
      marginBottom: 20,
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.subContainer}>
        <SettingsProfilePicture imgSource={profilePic} style={{marginBottom: 20}}/>
        <SettingsButtonGeneral label="Zmena profilového obrázka" onPress={() => router.push('./(settings)/(profile)')} iconName="camera" iconColor={colors.textPrimary} style={{marginBottom: 20}}/>
        <>
          <SettingsButtonGeneral label="Vzhľad" onPress={() =>  router.push('./(settings)/appearance')} iconName="brush" iconColor={colors.textPrimary} isGroup={true} isFirst={true}/>
          <SettingsButtonGeneral label="Osobné údaje" onPress={() =>  router.push('./(settings)/(profile)')} iconName="person" iconColor={colors.textPrimary} isGroup={true}/>
          <SettingsButtonGeneral label="Bezpečnosť" onPress={() => router.push('./(settings)/(security)')} iconName="lock-closed" iconColor={colors.textPrimary} isGroup={true}/>
          <SettingsButtonGeneral label="Notifikácie" onPress={() => router.push('./(settings)/notifications')} iconName="notifications" iconColor={colors.textPrimary} isGroup={true} isLast={true}/>
        </>
      </View>
      <View style={styles.subContainer}>
        <SettingsButtonGeneral 
          label="Odhlásiť sa"  iconName="exit" onPress={handleLogoutPress}
          isGroup={true} isFirst={true} 
          labelStyle={{color: dangerZoneColor}} iconColor={dangerZoneColor}
        />
        <SettingsButtonGeneral 
          label="Vymazať užívateľský účet" iconName="close-circle" onPress={() => setShowDeleteDialog(true)}
          isGroup={true} isLast={true} 
          labelStyle={{color: dangerZoneColor}} iconColor={dangerZoneColor}
        />
      </View>
      </ScrollView>

      <Modal
        visible={showDeleteDialog}
        transparent
        animationType='fade'
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            flex: 1,
            padding: 24,
            borderRadius: 12,
            width:'95%',
            maxHeight: 150,
            alignItems: 'center',
            marginTop: 10,
            backgroundColor: colors.background,
            borderColor: colors.textSecondary,
            borderWidth: 1,
          }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, marginBottom: 16, textAlign: 'center', }}>
              Naozaj chcete natrvalo vymazať svoj účet?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 15, }}>
              <TouchableOpacity style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.card, width: 80, justifyContent: 'center', paddingVertical: 8, borderRadius: 8, marginRight: 50 }} onPress={() => setShowDeleteDialog(false)}>
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Zrušiť</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.card, width: 80, justifyContent: 'center', paddingVertical: 8, borderRadius: 8, }} onPress={handleDeleteAccount} disabled={deleting}>
                <Text style={{ color: dangerZoneColor, fontSize: 16 }}>
                  {deleting ? 'Mažem...' : 'Vymazať'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
