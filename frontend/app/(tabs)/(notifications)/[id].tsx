import { getNotificationById, readNotificationById } from '@/api/notificationsApi';
import InfoField from '@/components/InfoField';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { formatDateTime } from '@/utils/formatDateTime';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type NotificationDataType = {
  id: number,
  report_id: number,
  title: string,
  note: string,
  sent_datetime: Date,
  read_datetime: Date
};

const notification_mock_data = {
  id: 0,
  report_id: 0,
  title: '',
  note: '',
  sent_datetime: new Date(),
  read_datetime: new Date(),
}

export default function NotificationDetail() {
  const { id } = useLocalSearchParams();

  const [notification, setNotification] = useState<NotificationDataType>(notification_mock_data);

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await getNotificationById(Number(id));
        const notif = {
          ...res.data,
          sent_datetime: res.data.sent_datetime ? new Date(res.data.sent_datetime) : null,
          read_datetime: res.data.read_datetime ? new Date(res.data.read_datetime) : null,
        };
        
        setNotification(notif);
        console.log(notif);

        if (!notif.read_datetime){
          const res = await readNotificationById(Number(notif.id));
          console.log("Read notification status: ", res.status);
        }
      } catch (error: any){
        if (error.response) {
          console.error('HTTP Error:', error.response.status);
          console.error('Error details:', error.response.data);
    
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

    fetchNotification();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      paddingTop: 10
    },
    text: {
      color: colors.background,
      fontSize: isAccessibilityMode ? 14 * 1.25 : 14,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
      >
        <InfoField name="Titulok" value={notification.title} style={{marginBottom: 10}}/>
        <InfoField name="Správa" value={notification.note} style={{marginBottom: 10}}/>
        <InfoField name="Čas" value={formatDateTime(notification.sent_datetime)} style={{marginBottom: 10}}/>
        {notification.report_id && <InfoField name="Hlásenie" value={`Hlásenie č. ${notification.report_id.toString()}`} style={{marginBottom: 10}}/>}
      </ScrollView>
    </View>
  );
}
