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
import AddressInputField from '@/components/AddressInputField'
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { createReport } from '@/api/reportApi';



export default function AddReportScreen() {
  const user = useProtectedRoute();
  if (!user) return null;
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

  const searchRef = useRef<any>(null);

  useEffect(() => {
    if (searchRef.current && addressText) {
      searchRef.current.setAddressText(addressText);
    }
  }, [addressText]);


  const handleSubmit = async () => {
    if (!user) {
      console.error('User is null');
      return;
    }

    const userId = Number(user.id);

    if (photos.length === 0 || !address || !note || !coords) {
      Alert.alert('Chyba', 'Vyplňte všetky polia!');
      return;
    }
    console.log(address);
    console.log(note);
    console.log(photos);

    try {
      const reportData = {
        user_id: userId,
        note: note,
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
      Alert.alert('Succes', 'Report created successfully');
    } catch (error: any) {
      if (error.response) {
        console.error('HTTP Error:', error.response.status);
        console.error('Error details:', error.response.data);

        Alert.alert('Error', error.response.data.detail);
      } else if (error.request) {
        Alert.alert('Network error', 'Please check your connection');
      } else {
        console.error('Unknown error', error);
        Alert.alert('Error', 'An error has occured');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff'}}
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
          <TextInput
            style={styles.input}
            placeholder="Pridať poznámku"
            placeholderTextColor="#999"
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
                  <Ionicons name="close" size={18} color="#fff" />
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
            <Text style={{ color: '#999', marginTop: 8 }}>Pridať fotky</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setActiveView('photo')}
          style={styles.photoAddButton}
        >
          <Ionicons name="add-circle-outline" size={32} color="#666" />
          <Text style={{ color: '#666', marginVertical: 4 }}>
            Pridať ďalšie fotky
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSubmit()} style={styles.photoAddButton}>
          <Text>Send</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  photoBox: {
    backgroundColor: '#ccc',
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
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  input: { flex: 1, fontSize: 16 },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
    zIndex: 1,
  },
  photoAddButton: {
    marginBottom: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
});
