import { StyleSheet, View, Text, TextInput, ViewStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    label: string,
    style?: ViewStyle,
    iconName?: string,
    onPress?: any;
}

export default function ReactionButton({label, style, iconName} : Props) {
  return (
    <View style={[styles.container, style]}>
        <Pressable style={styles.button}>
            <Text style={[styles.buttonLabel]}>{label}</Text>
            <Ionicons name={`${iconName}-outline` as keyof typeof Ionicons.glyphMap} size={22} style={styles.buttonIcon} />
        </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    flex: 1,
  },
  button: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
  buttonLabel: {
    fontSize: 13,
    lineHeight: 17,
    marginRight: 2
  },
  buttonIcon: {
    opacity: 0.7,
  }
});
  