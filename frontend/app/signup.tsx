import CredentialButton from '@/components/CredentialButton';
import CredentialField from '@/components/CredentialField';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


const PlaceholderImage = require('@/assets/images/icon.png');

type RegistrationForm = {
  first_name: string,
  email: string,
  password1: string,
  password2: string,
};

export default function SignUpScreen() {
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    first_name: "",
    email: "",
    password1: "",
    password2: ""
  });

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);

  const handleChange = (field: keyof typeof registrationForm, value: string) => {
    setRegistrationForm(prev => ({ ...prev, [field]: value }));
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
          <CredentialField<RegistrationForm>
            name="first_name" 
            field="first_name" 
            iconName="person"
            placeholder='Meno'
            value={registrationForm.first_name} 
            handleChange={handleChange}
          />
          <CredentialField<RegistrationForm>
            name="email" 
            field="email" 
            iconName="file-tray"
            placeholder='Email'
            value={registrationForm.email} 
            handleChange={handleChange}
          />
          <CredentialField<RegistrationForm>
            name="password1" 
            field="password1" 
            iconName="lock-closed"
            placeholder='Heslo'
            value={registrationForm.password1} 
            handleChange={handleChange}
          />
          <CredentialField<RegistrationForm>
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
