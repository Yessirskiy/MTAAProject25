import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhotoPicker from '@/components/PhotoPicker';
import MapPicker from '@/components/MapPicker';
import { getColors } from '@/theme/colors';
import AddressInputField from '@/components/AddressInputField'
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { createReport } from '@/api/reportApi';
import { useRouter } from 'expo-router';
import { UseTheme } from '@/contexts/ThemeContext';
import Toast from 'react-native-toast-message';


export default function AddReportScreen() {
  const user = useProtectedRoute();
  if (!user) return null;
  const router = useRouter();
  const [activeView, setActiveView] = useState<'main' | 'photo' | 'map'>('main');
  const [photos, setPhotos] = useState<string[]>([]);
  const [addressText, setAddressText] = useState('');
  const [address, setAddress] = useState<{
    building?: string;
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [note, setNote] = useState('');

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const handleSubmit = async () => {
    if (!user) {
      console.error('User is null');
      return;
    }

    const userId = Number(user.id);

    if (photos.length === 0 || !address || !note || !coords) {
      Alert.alert('Chyba', 'Vyplňte všetky polia');
      return;
    }
    console.log(address);
    console.log(note);
    console.log(photos);

    try {
      const reportData = {
        user_id: userId,
        note: note,
        admin_note: null,
        address: {
          building: address.building || '',
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          postal_code: address.postal_code || '',
          country: address.country || '',
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      };

      const result = await createReport(reportData, photos);

      console.log('Report created successfully', result);
      Alert.alert('Úspech', 'Hlásenie bolo úspešne vytvorené');

      router.replace('/');
      router.replace('../');

    } catch (error: any) {
      if (error.response) {
        console.error('HTTP Error:', error.response.status);
        console.error('Error details:', error.response.data);

        Alert.alert('Error', error.response.data.detail);
      } else if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`
        });
      } else {
        console.error('Unknown error', error);
        Alert.alert('Chyba', 'Nastala chyba');
      }
    }
  };

  if (activeView === 'photo') {
    return (
      <PhotoPicker
        onPhotoSelected={(newUris) => {
          setPhotos((prev) => [...prev, ...newUris]);
          setActiveView('main');
        }}
        onGoBack={() => setActiveView('main')}
      />
    );
  }

  if (activeView === 'map') {
    return (
      <MapPicker
        onLocationPicked={(locationData) => {
          setAddress(locationData.address);
          setCoords({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          });
          setAddressText(locationData.fullText);
        }}
        goBack={() => setActiveView('main')}
      />
    );
  }

  const screenWidth = Dimensions.get('window').width;

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    photoBox: {
      backgroundColor: colors.border,
      borderRadius: 10,
      width: screenWidth - 40,
      height: screenWidth - 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.card,
      backgroundColor: colors.card,
      borderRadius: 8,
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 15,
      marginBottom: 10,
    },
    input: { flex: 1, fontSize: isAccessibilityMode ? 16 * 1.25 : 16, color: colors.textPrimary },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: colors.textPrimary,
      borderRadius: 12,
      padding: 2,
      zIndex: 1,
    },
    photoAddButton: {
      marginBottom: 10,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      paddingVertical: 10,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background}}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <AddressInputField
          address={address}
          setAddress={setAddress}
          setCoords={setCoords}
          addressText={addressText}
          setAddressText={setAddressText}
          onMapPress={() => setActiveView('map')}
        />

        <View style={styles.inputContainer}>
          <Text style={{ position: 'absolute', marginLeft: 10, marginTop: -38, color: colors.textSecondary, fontSize: isAccessibilityMode ? 14 * 1.25 : 14 }}>Poznámka</Text>
          <TextInput
            style={[styles.input, { height: 40, paddingTop: 15 }]}
            placeholder="Pridať poznámku"
            placeholderTextColor={colors.textGrey}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
        
        {photos.length > 0 ? (
          <FlatList
            data={photos}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            scrollEnabled
            showsHorizontalScrollIndicator
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: item }} style={styles.photoBox} />
                <TouchableOpacity
                  onPress={() =>
                    setPhotos((prev) => prev.filter((uri) => uri !== item))
                  }
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={18} color={colors.background} />
                </TouchableOpacity>
              </View>
            )}
            style={{ maxHeight: screenWidth - 40, marginBottom: 10 }}
          />
        ) : (
          <TouchableOpacity
            onPress={() => setActiveView('photo')}
            style={styles.photoBox}
          >
            <Ionicons name="camera" size={48} color="#999" />
            <Text style={{ color: colors.icon, marginTop: 8, fontSize: isAccessibilityMode ? 14 * 1.25 : 14 }}>Pridať fotky</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setActiveView('photo')}
          style={styles.photoAddButton}
        >
          <Ionicons name="add-circle-outline" size={32} color="#666" />
          <Text style={{ color: colors.textSecondary, marginVertical: 4, fontSize: isAccessibilityMode ? 14 * 1.25 : 14 }}>
            Pridať ďalšie fotky
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSubmit()} style={styles.photoAddButton}>
          <Text style={{ color: colors.textPrimary, marginVertical: 4, fontSize: isAccessibilityMode ? 18 * 1.25 : 18 }}>Nahlásiť</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
