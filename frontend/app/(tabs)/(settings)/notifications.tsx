import { Text, View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useState } from 'react';
import SettingsButtonGeneral from '@/components/SettingsButtonGeneral'
import SettingsProfilePicture from '@/components/SettingsProfilePicture';
import InputField from '@/components/InputField';
import ButtonField from '@/components/ButtonField';
import ToggleSwitchField from '@/components/ToggleSwitchField';
import { router } from 'expo-router';


const PlaceholderImage = require('@/assets/images/icon.png');
const dangerZoneColor = '#D63E3E';

type UserPrivacyType = {
  is_notification_allowed: boolean,
  is_local_notification: boolean,
  is_weekly_notification: boolean,
  is_onchange_notification: boolean
  is_onreact_notification: boolean
};

const mock_data = {
  is_notification_allowed: true,
  is_local_notification: false,
  is_weekly_notification: false,
  is_onchange_notification: true,
  is_onreact_notification: false
}

export default function NotificationsScreen() {
  const [init_data] = useState<UserPrivacyType>(mock_data);
  const [cur_data, setCurData] = useState<UserPrivacyType>(mock_data);

  const handleChange = (field: keyof typeof cur_data, value: boolean) => {
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
        <Text style={styles.groupLabel}>Preferencie oznámení</Text>
        <ToggleSwitchField<UserPrivacyType> 
          name="Povolenie oznámení" 
          field='is_notification_allowed' 
          value={cur_data.is_notification_allowed} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
        />
        <ToggleSwitchField<UserPrivacyType> 
          name="Aktualizácií vo vašej lokalite" 
          field='is_local_notification' 
          value={cur_data.is_local_notification} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
          isDisabled={!cur_data.is_notification_allowed}
        />
        <ToggleSwitchField<UserPrivacyType> 
          name="Týždenné prehľady" 
          field='is_weekly_notification' 
          value={cur_data.is_weekly_notification} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
          isDisabled={!cur_data.is_notification_allowed}
        />
        <Text style={styles.groupLabel}>Vaše hlásenia</Text>
        <ToggleSwitchField<UserPrivacyType> 
          name="Oznámiť zmeny stavu hlásení" 
          field='is_onchange_notification' 
          value={cur_data.is_onchange_notification} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
          isDisabled={!cur_data.is_notification_allowed}
        />
        <ToggleSwitchField<UserPrivacyType> 
          name="Oznámiť o reakciách na hlásení" 
          field='is_onreact_notification' 
          value={cur_data.is_onreact_notification} 
          handleChange={handleChange}
          style={{marginBottom: 10}}
          isDisabled={!cur_data.is_notification_allowed}
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
