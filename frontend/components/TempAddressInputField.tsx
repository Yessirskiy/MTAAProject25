import { StyleSheet, View, Pressable, Text, TextInput, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, RelativePathString } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


interface AddressInputProps {
    address: string;
    setAddress: (addr: string) => void;
    setCoords: (coords: { latitude: number; longitude: number }) => void;
    onMapPress: () => void;
    name: string;
    iconName: string;
    style?: ViewStyle;
}

export default function TempAddressInputField({ address, setAddress, setCoords, onMapPress, name, iconName, style } : AddressInputProps) {
  const searchRef = useRef<any>(null);
  
  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  useEffect(() => {
      if (searchRef.current && address) {
          searchRef.current.setAddressText(address);
      }
  }, [address]);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: 55,
      paddingHorizontal: 15,
    },
    fieldContainer: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      justifyContent: 'center',
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
    },
    fieldLabel: {
      opacity: 0.7,
      fontSize: isAccessibilityMode ? 13 * 1.25 : 13,
      color: colors.textPrimary,
    },
    fieldInputArea: {
      flexDirection: 'row',
    },
    textInput: {
      flex: 1,
      fontSize: isAccessibilityMode ? 15 * 1.25 : 15,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{name}</Text>
        <View style={styles.fieldInputArea}>
          <GooglePlacesAutocomplete
            ref={searchRef}
            placeholder="Pridať polohu"
            onPress={(data, details = null) => {
                if (details) {
                const selectedAddress = details.formatted_address;
                const latitude = details.geometry.location.lat;
                const longitude = details.geometry.location.lng;
                setAddress(selectedAddress);
                setCoords({
                    latitude: latitude,
                    longitude: longitude,
                });
                }
            }}
            fetchDetails={true}
            query={{
                key: GOOGLE_API_KEY,
                language: 'sk',
                types: 'geocode',
                components: 'country:sk',
            }}
            autoFillOnNotFound={false}
            currentLocation={false}
            currentLocationLabel="Current location"
            debounce={0}
            disableScroll={true}
            enableHighAccuracyLocation={true}
            enablePoweredByContainer={true}
            filterReverseGeocodingByTypes={[]}
            GooglePlacesDetailsQuery={{}}
            GooglePlacesSearchQuery={{
            rankby: 'distance',
            type: 'restaurant',
            }}
            GoogleReverseGeocodingQuery={{}}
            isRowScrollable={true}
            keyboardShouldPersistTaps="always"
            listUnderlayColor="#c8c7cc"
            listViewDisplayed="auto"
            keepResultsAfterBlur={false}
            minLength={1}
            nearbyPlacesAPI="GooglePlacesSearch"
            numberOfLines={1}
            onFail={() => {}}
            onNotFound={() => {}}
            onTimeout={() =>
            console.warn('google places autocomplete: request timeout')
            }
            predefinedPlaces={[]}
            predefinedPlacesAlwaysVisible={false}
            styles={{
              container: {
                flex: 1,
                height: 30,
                marginRight: 5,
              },
              textInputContainer: {
                backgroundColor: 'transparent',
                padding: 0,
                margin: 0,
                height: 30,
              },
              textInput: {
                fontSize: isAccessibilityMode ? 15 * 1.25 : 15,
                flex: 0,
                backgroundColor: 'transparent',
                color: colors.textPrimary,
                marginLeft: -10,
                height: 25
              },
            }}
            suppressDefaultStyles={false}
            textInputHide={false}
            textInputProps={{}}
            timeout={20000}
        />
        <TouchableOpacity onPress={onMapPress}>
          {iconName && <Ionicons name={`${iconName}-outline` as keyof typeof Ionicons.glyphMap} size={22} style={{opacity: 0.7, color: colors.textPrimary}} />}
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
  