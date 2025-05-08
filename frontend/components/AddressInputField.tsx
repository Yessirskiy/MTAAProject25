import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


interface AddressInputProps {
    address: {
        building?: string;
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    } | null;
    setAddress: (addr: AddressInputProps['address']) => void;
    setCoords: (coords: { latitude: number; longitude: number }) => void;
    onMapPress: () => void;
    addressText: string;
    setAddressText: (text: string) => void;
}

export default function AddressInputField({ address, setAddress, setCoords, onMapPress, addressText, setAddressText }: AddressInputProps) {
    const searchRef = useRef<any>(null);
    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

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

    useEffect(() => {
        if (searchRef.current && address) {
            searchRef.current.setAddressText(addressText)
        }
    }, [addressText]);

    return (
        <View style={styles.inputContainer}>
            <GooglePlacesAutocomplete
                ref={searchRef}
                placeholder="Pridať polohu"
                onPress={(data, details = null) => {
                    if (details) {
                        const formattedAddress = formatAddress(details.address_components);
                        const latitude = details.geometry.location.lat;
                        const longitude = details.geometry.location.lng;

                        setAddress(formattedAddress);
                        setCoords({
                            latitude: latitude,
                            longitude: longitude,
                        });
                        setAddressText(data.description);
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
                timeout={20000}
                textInputProps={{}}
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
