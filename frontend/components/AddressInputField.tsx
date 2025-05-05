import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


interface AddressInputProps {
    address: string;
    setAddress: (addr: string) => void;
    setCoords: (coords: { latitude: number; longitude: number }) => void;
    onMapPress: () => void;
}

export default function AddressInputField({ address, setAddress, setCoords, onMapPress }: AddressInputProps) {
    const searchRef = useRef<any>(null);

    useEffect(() => {
        if (searchRef.current && address) {
            searchRef.current.setAddressText(address);
        }
    }, [address]);

    return (
        <View style={styles.inputContainer}>
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
                    key: 'AIzaSyB2s1LM7NXJot8ot0iLKayEObKgs-LZic8',
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
                    container: { flex: 1 },
                    textInput: {
                    height: 40,
                    borderColor: 'transparent',
                    fontSize: 16,
                    },
                    listView: { zIndex: 100 },
                }}
                suppressDefaultStyles={false}
                textInputHide={false}
                textInputProps={{}}
                timeout={20000}
                />
                <TouchableOpacity onPress={onMapPress}>
                    <Ionicons name="compass" size={22} color="#888" />
                </TouchableOpacity>
        </View>
    );

}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
    }
})
