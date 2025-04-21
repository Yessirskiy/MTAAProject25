import { StyleSheet, View, Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label: string;
  iconName: string;
  isFirst?: boolean;
  isLast?: boolean;
  isGroup?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  iconColor?: string;
};

export default function SettingsButtonGeneral({ label, iconName, style, labelStyle, iconColor = "black", isFirst = false, isLast = false, isGroup = false }: Props) {
  return (
    <View style={[styles.buttonContainer, style]}>
      <Pressable 
        style={[
          styles.button, 
          isGroup ? {
            borderTopLeftRadius: (isFirst ? 8 : 0),
            borderTopRightRadius: (isFirst ? 8 : 0),
            borderBottomLeftRadius: (isLast ? 8 : 0),
            borderBottomRightRadius: (isLast ? 8 : 0),
          } : {borderRadius: 8},
        ]} 
        onPress={() => alert('You pressed a button.')}
      >
        <Text style={[styles.buttonLabel, labelStyle]}>{label}</Text>
        <Ionicons name={`${iconName}-outline` as keyof typeof Ionicons.glyphMap} size={22} color={iconColor} style={{opacity: 0.7}} />
      </Pressable>
      {(isGroup && !isLast) && 
        <View style={{backgroundColor: '#F1F1F1', width: '100%', alignItems: 'center'}}>
          <View style={styles.divider}/>
        </View>}
    </View>
  );
}
// {isGroup && <View style={{ width: '95%', height: 1, backgroundColor: '#000000', opacity: 0.9}} />}
const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 15,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: "#F1F1F1",
  },
  divider: {
    width: '95%', 
    height: StyleSheet.hairlineWidth, 
    backgroundColor: '#000000', 
    opacity: 0.9
  },
  buttonLabel: {
    color: '#000000',
    fontSize: 16,
    opacity: 0.9,
  },
});
