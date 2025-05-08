import 'react-native-get-random-values';
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


type Address = {
    building: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
}

const mock_address: Address = {
    building: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    latitude: 0,
    longitude: 0,
}

type MapProps = {
    onLocationPicked: (address: Address) => void;
    goBack: () => void;
}

export default function TempMapPicker({ onLocationPicked, goBack }: MapProps) {
    const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
    const [structAddress, setStructAddress] = useState(mock_address);

    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    const mapRef = useRef<MapView>(null);
    const searchRef = useRef<any>(null);
    
    const handleMapPress = async (e: MapPressEvent) => {
        const coords = e.nativeEvent.coordinate;
        setMarker(coords);

        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}&language=sk`;
        const res = await fetch(geocodeUrl);
        const json = await res.json();
        if (json.results.length > 0) {
            const addressComponents = json.results[0].address_components;

            let building = '';
            let street = '';
            let city = '';
            let state = '';
            let postal_code = '';

            addressComponents.forEach((component: { types: any; long_name: string; }) => {
                const types = component.types;

                if (types.includes('street_number')) {
                    building = component.long_name;
                } else if (types.includes('route')) {
                    street = component.long_name;
                } else if (types.includes('locality')) {
                    city = component.long_name;
                } else if (types.includes('administrative_area_level_2')) {
                    if (!city) {
                        city = component.long_name;
                    }
                } else if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                } else if (types.includes('postal_code')) {
                    postal_code = component.long_name;
                }
            });
            setStructAddress({
                building: building,
                street: street,
                city: city,
                state: state,
                postal_code: postal_code,
                country: 'Slovakia',
                latitude: coords.latitude,
                longitude: coords.longitude
            })
            console.log("STRUCTED ADDR:", {
                building: building,
                street: street,
                city: city,
                state: state,
                postal_code: postal_code,
                country: 'Slovakia'
            });
            searchRef.current?.setAddressText(json.results[0].formatted_address);
        }
    };

    const handleAccept = () => {
        if (!marker || !structAddress) return;
        onLocationPicked(structAddress);
        goBack();
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <GooglePlacesAutocomplete
                    ref={searchRef}
                    placeholder="Search"
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
                        }
                    }}
                    suppressDefaultStyles={false}
                    textInputHide={false}
                    textInputProps={{}}
                    timeout={20000}
                />

                <MapView
                    ref={mapRef}
                    style={styles.map}
                    onPress={handleMapPress}
                    showsUserLocation
                >
                    {marker && <Marker coordinate={marker} title="Vybrané miesto" />}
                </MapView>

                <View style={styles.addressContainer}>
                    <TouchableOpacity onPress={handleAccept} style={styles.acceptButton}>
                        <Text style={styles.acceptText}>Potvrdiť</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    addressContainer: {
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    addressText: {
        fontSize: 14,
        marginBottom: 10,
    },
    acceptButton: {
        backgroundColor: '#2e86de',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptText: { color: '#fff', fontWeight: 'bold', },
});
