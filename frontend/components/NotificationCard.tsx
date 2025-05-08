import { StyleSheet, View, Pressable, Text, ViewStyle, TextStyle } from 'react-native';

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

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // Months are 0-based
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}-${month}-${year}`;
}

export default function ButtonField({notification, onPress, containerStyle, titleStyle, noteStyle, receivedStyle} : Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable style={[styles.pressableContainer]} onPress={onPress}>
        <Text style={[styles.titleStyle, titleStyle]}>{notification.title}</Text>
        <Text style={[styles.noteStyle, noteStyle]}>{notification.note}</Text>
        <Text style={[styles.receivedStyle, receivedStyle]}>{formatDateTime(notification.sent_datetime)}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 140,
  },
  pressableContainer: {
    backgroundColor: '#F1F1F1',
    marginHorizontal: 18,
    padding: 10,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'column',
    
  },
  titleStyle: {
    fontSize: 15,
    marginBottom: 7,
  },
  noteStyle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 'auto'
  },
  receivedStyle: {
    fontSize: 10,
    opacity: 0.5
  }
});
  