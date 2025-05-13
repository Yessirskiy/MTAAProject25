import CredentialButton from '@/components/CredentialButton';
import CredentialField from '@/components/CredentialField';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import { register, login } from '@/api/authApi';
import { useContext } from 'react';
import Toast from 'react-native-toast-message';
import { AuthContext } from '@/contexts/AuthContext';



const PlaceholderImage = require('@/assets/images/icon.png');

type RegisterData = {
  first_name: string,
  email: string,
  password1: string,
  password2: string,
};

type LoginForm = {
  email: string,
  password: string,
};

export default function SignUpScreen() {
  const [registrationForm, setRegistrationForm] = useState<RegisterData>({
    first_name: "",
    email: "",
    password1: "",
    password2: ""
  });

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);

  const auth = useContext(AuthContext);
  const router = useRouter();

  const handleChange = (field: keyof typeof registrationForm, value: string) => {
    setRegistrationForm((prev: RegisterData) => ({ ...prev, [field]: value }));
  };

  const handlePress = async () => {
    console.log(registrationForm);
    try {
      await register(registrationForm);

      await auth.login(registrationForm.email, registrationForm.password1);

      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.response) {
        console.error('HTTP Error:', error.response.status);
        console.error('Error details:', error.response.data);

        if (error.response.status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Invalid email or password.',
          });
        } else if (error.response.data?.detail) {
          const errorMessages = Array.isArray(error.response.data.detail)
            ? error.response.data.detail.map((err: any) => err.msg).join(', ')
            : error.response.data.detail;

          Toast.show({
            type: 'error',
            text1: 'Registration failed.',
            text2: errorMessages,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'An unknown error occurred.',
            text2: `Return code: ${error.response.status}`,
          });
        }
      } else if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`,
        });
      } else {
        console.log(error);
        Toast.show({
          type: 'error',
          text1: 'Unknown error.',
        });
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      height: "100%",
      flexDirection: 'column',
      backgroundColor: colors.background,
      paddingTop: 120,
      alignItems: 'center',
    },
    subContainer: {
      width: '100%',
      backgroundColor: colors.background,
      alignItems: 'center'
    },
    logo: {
      width: "50%",
      height: 140,
      borderRadius: 10,
      marginBottom: 40
    },
    titleText: {
      color: colors.textPrimary,
      fontSize: 32
    },
    sloganText: {
      color: colors.textPrimary,
      opacity: 0.8,
      fontSize: 13
    },
    hintText: {
      color: colors.textPrimary,
      opacity: 0.5,
      fontSize: 10
    }
  });

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
        <View style={[styles.subContainer, {paddingTop: 50}]}>
          <CredentialField<RegisterData>
            name="first_name" 
            field="first_name" 
            iconName="person"
            placeholder='Meno'
            value={registrationForm.first_name} 
            handleChange={handleChange}
          />
          <CredentialField<RegisterData>
            name="email" 
            field="email" 
            iconName="file-tray"
            placeholder='Email'
            value={registrationForm.email} 
            handleChange={handleChange}
          />
          <CredentialField<RegisterData>
            name="password1" 
            field="password1" 
            iconName="lock-closed"
            placeholder='Heslo'
            value={registrationForm.password1} 
            handleChange={handleChange}
          />
          <CredentialField<RegisterData>
            name="password2" 
            field="password2" 
            iconName="lock-closed"
            placeholder='Heslo (potvrdenie)'
            value={registrationForm.password2} 
            handleChange={handleChange}
          />
          <CredentialButton
            label="Zaregistrovať sa"
            iconName="enter-outline"
            style={{marginTop: 20}}
            onPress={handlePress}
          />
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.hintText}>Máte účet? </Text>
            <Link href="/signin" asChild>
            <Pressable>
              <Text style={styles.hintText}>Prihláste sa!</Text>
            </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
