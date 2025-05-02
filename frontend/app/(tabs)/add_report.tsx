import React, { useState } from 'react';
import { Text, View, TextInput, StyleSheet, TouchableOpacity, Image, Alert, TouchableWithoutFeedback, Keyboard, Dimensions, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhotoPicker from '@/components/PhotoPicker';


export default function AddReportScreen() {
  const [activeView, setActiveView] = useState<'main' | 'photo' | 'map'>('main');

  const [photos, setPhotos] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  const handlePhoto = (uris: string[]) => {
    setPhotos(uris);
    setActiveView('main');
  };

  const handleSubmit = () => {
    if (!photos || !address || !note) {
      Alert.alert('Chyba', 'Vyplňte všetky polia!');
      return;
    }
  };
  
  if (activeView === 'photo') {
    return <PhotoPicker onPhotoSelected={(newUris) => {
      setPhotos((prev) => [...prev, ...newUris]);
      setActiveView('main');
    }} onGoBack={() => setActiveView('main')} />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>

        {photos.length > 0 ? (
            <View style={{ height: screenWidth - 40, marginBottom: 10 }}>
              <FlatList
                data={photos}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={true}
                renderItem={({ item }) => (
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: item }}
                      style={styles.photoBox}
                    />
                    <TouchableOpacity onPress={() => setPhotos(prev => prev.filter(uri => uri !== item))}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 12,
                      padding: 2,
                      zIndex: 1,
                    }}
                    >
                      <Ionicons name="close" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          ) : (
            <TouchableOpacity onPress={() => setActiveView('photo')} style={styles.photoBox}>
              <Ionicons name="camera" size={48} color="#999" />
              <Text style={{ color: '#999', marginTop: 8, }}>Pridať fotky</Text>
            </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setActiveView('photo')}
          style={{ marginBottom: 10, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}
        >
          <Ionicons name="add-circle-outline" size={32} color="#666" />
          <Text style={{ color: '#666', marginTop: 4, marginBottom: 4 }}>Pridať ďalšie fotky</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pridať polohu"
            placeholderTextColor="#999"
            editable={true}
          />
          <TouchableOpacity onPress={() => setActiveView('map')}>
            <Ionicons name='compass' size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Pridať poznámku'
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  input: { flex: 1, fontSize: 16 },
  submitButton: {
    backgroundColor: '#ccc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});
