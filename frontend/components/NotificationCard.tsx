import { StyleSheet, View, Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { formatDateTime } from '@/utils/formatDateTime';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


type Notification = {
  id: number,
  report_id?: number,
  title: string,
  note: string,
  sent_datetime: Date,
  read_datetime: Date,
}

type Props = {
  notification: Notification,
  onPress: any,
  containerStyle?: ViewStyle,
  titleStyle?: TextStyle,
  noteStyle?: TextStyle,
  receivedStyle?: TextStyle,
}

export default function ButtonField({notification, onPress, containerStyle, titleStyle, noteStyle, receivedStyle} : Props) {
  
  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      minHeight: 140,
    },
    pressableContainer: {
      position: 'relative',
      backgroundColor: colors.lightGrey,
      marginHorizontal: 18,
      padding: 10,
      borderRadius: 8,
      flex: 1,
      flexDirection: 'column',
      
    },
    titleStyle: {
      fontSize: isAccessibilityMode ? 15 * 1.25: 15,
      marginBottom: 7,
      color: colors.textPrimary,
    },
    noteStyle: {
      fontSize: isAccessibilityMode ? 14 * 1.25 : 14,
      opacity: 0.8,
      marginBottom: 'auto',
      color: colors.textPrimary,
    },
    receivedStyle: {
      fontSize: isAccessibilityMode ? 10 * 1.25 : 10,
      opacity: 0.5,
      color: colors.textPrimary,
    },
    unreadDot: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 15,
      height: 15,
      borderRadius: 10,
      backgroundColor: colors.accentRedLight,
    }
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable style={[styles.pressableContainer]} onPress={onPress}>
        <Text style={[styles.titleStyle, titleStyle]}>{notification.title}</Text>
        <Text style={[styles.noteStyle, noteStyle]}>{notification.note}</Text>
        <Text style={[styles.receivedStyle, receivedStyle]}>{formatDateTime(notification.sent_datetime)}</Text>
        {!notification.read_datetime && (
          <View style={styles.unreadDot} />
        )}
      </Pressable>
    </View>
  );
};
  