import { Text, View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useLayoutEffect, useState } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';
import ButtonField from '@/components/ButtonField';
import ToggleSwitchField from '@/components/ToggleSwitchField';
import { router } from 'expo-router';
import { getUserSettingsMe, updateUserSettingsMe } from '@/api/userApi';
import Toast from 'react-native-toast-message';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


const PlaceholderImage = require('@/assets/images/icon.png');
const dangerZoneColor = '#D63E3E';

type AppearanceType = {
  is_dark_mode: boolean,
  is_accessibility: boolean,
};

const mock_data = {
  is_dark_mode: false,
  is_accessibility: false,
}

export default function NotificationsScreen() {

  const { isDarkMode, toggleDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode, toggleAccessibility } = UseTheme();

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
    groupLabel: {
      alignSelf: 'flex-start', 
      marginLeft: 18, 
      marginBottom: 7,
      fontSize: isAccessibilityMode ? 14 * 1.25 : 14,
      opacity: 0.7,
      color: colors.textPrimary,
    }
  });


  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.subContainer}>
        <Text style={styles.groupLabel}>Vzľad aplikácie</Text>
        <ToggleSwitchField<AppearanceType> 
          name="Tmavý režim" 
          field='is_dark_mode' 
          value={isDarkMode} 
          handleChange={toggleDarkMode}
          style={{marginBottom: 10}}
        />
        <ToggleSwitchField<AppearanceType> 
          name="Režim prístupnosti" 
          field='is_accessibility' 
          value={isAccessibilityMode} 
          handleChange={toggleAccessibility}
          style={{marginBottom: 10}}
        />
      </View>
      </ScrollView>
    </View>
  );
}
