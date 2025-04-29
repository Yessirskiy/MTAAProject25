import CredentialButton from '@/components/CredentialButton';
import CredentialField from '@/components/CredentialField';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, Image, ScrollView } from 'react-native';

const PlaceholderImage = require('@/assets/images/icon.png');

type LoginForm = {
  email: string,
  password: string,
};

export default function SignInScreen() {
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: ""
  });

  const handleChange = (field: keyof typeof loginForm, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.subContainer]}>
          <Image source={PlaceholderImage} style={styles.logo} />
          <Text style={styles.titleText}>REPORT APP</Text>
          <Text style={styles.sloganText}>Na meste nam zaleží</Text>
        </View>
        <View style={[styles.subContainer, {paddingTop: 140}]}>
          <CredentialField<LoginForm>
            name="email" 
            field="email" 
            iconName="file-tray"
            placeholder='Email'
            value={loginForm.email} 
            handleChange={handleChange}
          />
          <CredentialField<LoginForm>
            name="password" 
            field="password" 
            iconName="lock-closed"
            placeholder='Password'
            value={loginForm.password} 
            handleChange={handleChange}
          />
          <CredentialButton
            label="Prihláste sa"
            iconName="enter-outline"
            style={{marginTop: 20}}
          />
          <Text style={styles.hintText}>Nemáte účet? Vytvorte si účet!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
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
    marginBottom: 40
  },
  titleText: {
    color: '#000000',
    fontSize: 32
  },
  sloganText: {
    color: '#000000',
    opacity: 0.8,
    fontSize: 13
  },
  hintText: {
    color: '#000000',
    opacity: 0.5,
    fontSize: 10
  }
});