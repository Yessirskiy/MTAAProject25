import 'react-native-get-random-values';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


const screenWidth = Dimensions.get('window').width;

type LocationData = {
    address: {
        building?: string;
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
    latitude: number;
    longitude: number;
    fullText: string;
};

type MapProps = {
    onLocationPicked: (location: LocationData) => void;
    goBack: () => void;
}

export default function MapPicker({ onLocationPicked, goBack }: MapProps) {
    const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
    const [addressText, setAddressText] = useState('');
    const [address, setAddress] = useState<{
        building?: string;
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    } | null>(null);
    const [region, setRegion] = useState<Region | null>(null);
    const mapRef = useRef<MapView>(null);

    const { isDarkMode } = UseTheme();
    const colors = getColors(isDarkMode);
    const { isAccessibilityMode } = UseTheme();

    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    const searchRef = useRef<any>(null);
    
    useEffect(() => {
        (async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location access is required to show your location.');
            return;
          }
    
          const loc = await Location.getCurrentPositionAsync({});
    
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          });
        })();
    }, []);

    useEffect(() => {
        if (searchRef.current && addressText) {
            searchRef.current.setAddressText(addressText);
        }
    }, [addressText]);
    
    const formatAddress = (addressComponents: any) => {
        const getComponent = (type: string) =>
            addressComponents.find((component: any) => component.types.includes(type))?.long_name || "";
        
        return {
            building: getComponent("street_number"),
            street: getComponent("route"),
            city: getComponent("locality") || getComponent("administrative_area_level_2"),
            state: getComponent("administrative_area_level_1"),
            postal_code: getComponent("postal_code"),
            country: getComponent("country"),
        };
    };


    const handleMapPress = async (e: MapPressEvent) => {
        const coords = e.nativeEvent.coordinate;
        setMarker(coords);

        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}&language=sk`;
        const res = await fetch(geocodeUrl);
        const json = await res.json();
        
        if (json.results.length > 0) {
            const formattedAddress = formatAddress(json.results[0].address_components);
            setAddress(formattedAddress);
            setAddressText(json.results[0].formatted_address);
        }
    };

    const handleAccept = () => {
        if (!marker || !address) return;
        onLocationPicked({
            address: {
                building: address?.building || '',
                street: address?.street || '',
                city: address?.city || '',
                state: address?.state || '',
                postal_code: address?.postal_code || '',
                country: address?.country || '',
            },
            latitude: marker.latitude,
            longitude: marker.longitude,
            fullText: addressText,
        });
        console.log(addressText);
        console.log(address);
        console.log(marker);
        goBack();
    }

    const styles = StyleSheet.create({
        container: { flex: 1 },
        map: { flex: 1 },
        addressContainer: {
            padding: 12,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderColor: colors.buttonBackground,
        },
        addressText: {
            fontSize: isAccessibilityMode ? 14 * 1.25 : 14,
            marginBottom: 10,
        },
        acceptButton: {
            backgroundColor: '#2e86de',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
        },
        backButton: {
            position: 'absolute',
            top: 70,
            left: 20,
            zIndex: 1,
        },
        acceptText: { color: '#fff', fontWeight: 'bold', fontSize: isAccessibilityMode ? 14 * 1.25 : 14 },
    });

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>

                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <GooglePlacesAutocomplete
                    ref={searchRef}
                    placeholder="Vyhľadať"
                    onPress={(data, details = null) => {
                        const location = details?.geometry?.location;
                        if (location) {
                            const coords = {
                                latitude: location.lat,
                                longitude: location.lng,
                            };
                            setMarker(coords);
                            if (mapRef.current) {
                                mapRef.current.animateToRegion({
                                    ...coords,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                });
                            }
                            const formattedAddress = formatAddress(details?.address_components || []);
                            setAddress(formattedAddress);
                            setAddressText(data.description);
                        }
                    }}
                    query={{
                        key: GOOGLE_API_KEY,
                        language: 'sk',
                        types: 'geocode',
                        components: 'country:sk'
                    }}
                    autoFillOnNotFound={false}
                    currentLocation={false}
                    currentLocationLabel="Current location"
                    debounce={0}
                    disableScroll={false}
                    enableHighAccuracyLocation={true}
                    enablePoweredByContainer={true}
                    fetchDetails={true}
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
                            position: 'absolute',
                            top: 10,
                            width: '100%',
                            zIndex: 1,
                        },
                        textInput: {
                            marginHorizontal: 10,
                            borderColor: '#ccc',
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            height: 44,
                            fontSize: isAccessibilityMode ? 15 * 1.25 : 15,
                        }
                    }}
                    suppressDefaultStyles={false}
                    textInputHide={false}
                    textInputProps={{}}
                    timeout={20000}
                />

                {region && (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        onPress={handleMapPress}
                        showsUserLocation
                        region={region}
                    >
                        {marker && <Marker coordinate={marker} title="Vybrané miesto" />}
                    </MapView>
                )}

                <View style={styles.addressContainer}>
                    <TouchableOpacity onPress={handleAccept} style={styles.acceptButton}>
                        <Text style={styles.acceptText}>Potvrdiť</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}
