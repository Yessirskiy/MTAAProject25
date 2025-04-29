import { Text, View, StyleSheet, Image, ScrollView } from 'react-native';

const PlaceholderImage = require('@/assets/images/icon.png');

export default function SignInScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.subContainer]}>
          <Image source={PlaceholderImage} style={styles.logo} />
          <Text style={styles.text}>SignIn screen</Text>
        </View>
        <View style={styles.subContainer}>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingTop: 120,
    alignItems: 'center',
  },
  subContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center'
  },
  logo: {
    width: "50%",
    height: 140,
    borderRadius: 10,
  },
  text: {
    color: '#fff',
  },
});