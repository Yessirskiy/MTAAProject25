import { StyleSheet, View, Pressable, Text, ViewStyle, TextStyle } from 'react-native';

type Props = {
  label: string,
  style?: ViewStyle,
  buttonStyle?: ViewStyle,
  labelStyle?: TextStyle,
  onPress?: (...args: any[]) => void,
  disabled?: boolean
}

export default function ButtonField({label, style, buttonStyle, labelStyle, onPress, disabled=false} : Props) {
  return (
    <View style={[styles.container, style]}>
      <Pressable style={[styles.fieldContainer, buttonStyle]} onPress={onPress} disabled={disabled}>
        <Text style={[styles.fieldLabel, labelStyle]}>{label}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 55,
    paddingHorizontal: 15,
  },
  fieldContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F1F1F1",
    borderRadius: 8,
  },
  fieldLabel: {
    opacity: 0.9,
    fontSize: 16,
    marginBottom: 2,
  }
});
  