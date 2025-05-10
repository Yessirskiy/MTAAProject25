import React, { useState, useEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';import AddressInputField from '@/components/AddressInputField';
import MapPicker from '@/components/MapPicker';
import { AuthContext } from '@/contexts/AuthContext';
import { parse } from '@babel/core';
import { updateReport } from '@/api/reportApi';


type Report = {
  id: number;
  status: string;
  report_datetime: string;
  published_datetime: string | null;
  note: string;
  votes_pos: number;
  votes_neg: number;
  user: {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
    phone_number: string | null;
    created_datetime: string;
  };
  address: {
    id: number;
    report_id: number;
    building: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  photos: {
    id: number;
    report_id: number;
  }[];
};

type ReportWithPhoto = Report & {
  photoUri: string | null;
};

type EditReportProps = {
    report: ReportWithPhoto;
    onGoBack: () => void;
    accessToken: string | null;
};

export default function EditReport({ report, onGoBack, accessToken }: EditReportProps) {
    const [activeView, setActiveView] = useState<'main' | 'edit' | 'map'>('main');
    const [addressText, setAddressText] = useState('');
    const [address, setAddress] = useState<{
        building?: string;
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    } | null>({
        building: report.address.building,
        street: report.address.street,
        city: report.address.city,
        state: report.address.state,
        postal_code: report.address.postal_code,
        country: report.address.country
    });
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>({latitude: parseFloat(report.address.latitude), longitude: parseFloat(report.address.longitude)});
    const [note, setNote] = useState(report.note);

    useEffect(() => {
        const addr = report.address;
        const fullAddress = [
            addr.building,
            addr.street,
            addr.city,
            addr.state,
            addr.postal_code,
            addr.country,
        ]
        .filter(Boolean)
        .join(', ');

        setAddressText(fullAddress);
    }, []);

    const handleSave = async () => {
        console.log('Saving:', address, note, coords);

        try {
            const reportData = {
                note: note,
                address: {
                    building: address?.building || '',
                    street: address?.street || '',
                    city: address?.city || '',
                    state: address?.state || '',
                    postal_code: address?.postal_code || '',
                    country: address?.country || '',
                    latitude: coords?.latitude || 0,
                    longitude: coords?.longitude || 0,
                },
            };

            const result = await updateReport(report.id, reportData);
            Alert.alert('Úspech', 'Hlásenie bolo úspešne upravené');
            onGoBack();
        } catch (error: any) {
            if (error.response) {
                console.error('HTTP Error:', error.response.status);
                console.error('Error details:', error.response.data);
        
                Alert.alert('Error', error.response.data.detail);
            } else if (error.request) {
                Alert.alert('Chyba siete', 'Prosím skontrolujte vaše pripojenie');
            } else {
                console.error('Unknown error', error);
                Alert.alert('Chyba', 'Nastala chyba');
            }
        }
    };

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
            goBack={() => setActiveView('edit')}
        />
        )
    }

    if (activeView === 'main') {

        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.label1}>Adresa</Text>
                <TextInput
                    editable={false}
                    value={`${report.address?.street === '' ? '' : `${report.address?.street} `}${report.address?.building === '' ? '' : `${report.address?.building} `}${report.address?.postal_code === '' ? '' : `${report.address?.postal_code} `}${report.address?.city}`}
                    style={styles.textInfo}
                />
                <Text style={styles.label}>Poznámka</Text>
                <TextInput
                    editable={false}
                    value={report.note}
                    style={styles.textInfo}
                />
                <FlatList
                    data={report.photos}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    pagingEnabled
                    scrollEnabled
                    showsHorizontalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }: { item: { id: number } }) => (
                    <View style={{ position: 'relative' }}>
                        <Image
                            style={styles.image}
                            source={{
                            uri: `http://192.168.240.23:8000/report/photo/${item.id}` || undefined,
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                            }}
                        />
                    </View>
                    )}
                />
                <TouchableOpacity onPress={() => setActiveView('edit')} style={styles.editButton}>
                    <Text style={{ color: '#666', marginVertical: 8 }}>Upraviť hlásenie</Text>
                </TouchableOpacity>
            </View>
        )
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
                <Text style={styles.header}>Upraviť hlásenie</Text>
                <Text style={styles.label}>Adresa:</Text>
                <AddressInputField
                address={address}
                setAddress={setAddress}
                setCoords={setCoords}
                addressText={addressText}
                setAddressText={setAddressText}
                onMapPress={() => setActiveView('map')}
                />
                <Text style={styles.label}>Poznámka:</Text>
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    multiline
                    style={styles.textInput}
                    placeholder='Zadajte poznámku'
                />

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveView('main')}>
                        <Text style={styles.buttonText}>Zrušiť</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.buttonText}>Uložiť</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )

}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    header: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 20,
    },
    image: {
        backgroundColor: '#ccc',
        borderRadius: 10,
        width: screenWidth - 40,
        height: screenWidth - 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginBottom: 20,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    textInfo: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
        minHeight: 40,
        textAlignVertical: 'top',
    },
    label: {
        fontWeight: 'bold',
        marginBlock: 6,
    },
    label1: {
        marginTop: 30,
        fontWeight: 'bold',
        marginBlock: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: '#aaa',
        padding: 12,
        borderRadius: 6,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 6,
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    editButton: {
        marginBottom: 10,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 10,
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 10,
        zIndex: 10,
        padding: 8,
    },
});
