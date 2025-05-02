import { login } from '@/api/authApi';
import CredentialButton from '@/components/CredentialButton';
import CredentialField from '@/components/CredentialField';
import { Link, useRouter } from 'expo-router';
import { useState, useContext } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../contexts/AuthContext';

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

  const auth = useContext(AuthContext);
  const router = useRouter();

  const handleChange = (field: keyof typeof loginForm, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePress = async () => {
    try {
      // Your async logic here
      console.log('Fetching something...');
      const res = await auth.login(loginForm.email, loginForm.password)
      console.log("successful login")
      router.replace('/(tabs)')
    } catch (error: any) {
      if (error.response) {
        console.error('HTTP Error:', error.response.status);
        console.error('Error details:', error.response.data);
  
        if (error.response.status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Invalid email or password.'
          });
        } else {
          Toast.show({
            type: 'error',
            text1:  error.response.data.detail,
            text2: `Return code: ${error.response.status}`
          });
        }
      } else if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection`
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


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
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
            placeholder='Heslo'
            value={loginForm.password} 
            handleChange={handleChange}
          />
          <CredentialButton
            label="Prihláste sa"
            iconName="enter-outline"
            style={{marginTop: 20}}
            onPress={handlePress}
          />
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.hintText}>Nemáte účet? </Text>
            <Link href="/signup" asChild>
              <Pressable>
                <Text style={styles.hintText}>Vytvorte si účet!</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    fontSize: 11
  }
});