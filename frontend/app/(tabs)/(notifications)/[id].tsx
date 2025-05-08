import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotificationDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Notification Details for ID: {id}</Text>
    </View>
  );
}
