import { Text, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getNotificationsMe } from '@/api/notificationsApi';
import NotificationCard from '@/components/NotificationCard';
import Toast from 'react-native-toast-message';
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

export default function NotificationsScreen() {
  const user = useProtectedRoute();
  if (!user) return null;

  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationDataType[]>([]);

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotificationsMe();
        const parsedNotifications = res.data.data.map((n: any) => ({
          ...n,
          sent_datetime: n.sent_datetime ? new Date(n.sent_datetime) : null,
          read_datetime: n.read_datetime ? new Date(n.read_datetime) : null,
        }));
        
        setNotifications(parsedNotifications);
        console.log(parsedNotifications);
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

    fetchNotifications();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
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
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => router.push(`/(notifications)/${notification.id}`)}
            containerStyle={{marginBottom: 15}}
          />
        ))}
      </ScrollView>
    </View>
  );
}
