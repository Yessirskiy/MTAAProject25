import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


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

    const { isDarkMode } = UseTheme();
    const colors = getColors(isDarkMode);
    const { isAccessibilityMode } = UseTheme();

    useEffect(() => {
        if (searchRef.current && address) {
            searchRef.current.setAddressText(addressText)
        }
    }, [addressText]);

    const styles = StyleSheet.create({
        inputContainer: {
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: colors.card,
            borderRadius: 8,
            alignItems: 'center',
            paddingRight: 10,
            paddingVertical: 8,
            marginBottom: 10,
            backgroundColor: colors.card,
        },
    });

    return (
        <View>
        <Text style={{ position: 'absolute', marginTop: 10, marginLeft: 12, zIndex: 100, color: colors.textSecondary, fontSize: isAccessibilityMode ? 14 * 1.25 : 14 }}>Adresa</Text>
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
                    isRowScrollable={false}
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
                        container: { flex: 1, backgroundColor: colors.card },
                        textInput: {
                            marginTop: isAccessibilityMode ? 17 : 10,
                            height: 40,
                            borderColor: 'transparent',
                            fontSize: isAccessibilityMode ? 16 * 1.25 : 16,
                            backgroundColor: colors.card,
                            color: colors.textPrimary,
                        },
                        listView: { zIndex: 100, backgroundColor: colors.card, color: colors.textPrimary },
                        textInputContainer: {
                            backgroundColor: colors.card,
                            color: colors.textPrimary,
                        },
                        row: {
                            backgroundColor: colors.card,
                            borderRadius: 8,
                            color: colors.textPrimary,
                        },
                        poweredContainer: {
                            backgroundColor: colors.card,
                            color: colors.textPrimary,
                        },
                        powered: {
                            color: colors.textPrimary,
                        },
                        description: {
                            color: colors.textPrimary,
                        },
                        predefinedPlacesDescription: {
                            color: colors.textPrimary,
                        },
                    }}
                    suppressDefaultStyles={false}
                    textInputHide={false}
                    timeout={20000}
                    textInputProps={{
                        placeholderTextColor: colors.textGrey
                    }}
                />
                <TouchableOpacity onPress={onMapPress}>
                    <Ionicons name="map" size={22} color={colors.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );

}
