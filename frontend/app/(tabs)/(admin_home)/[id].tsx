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
import { Ionicons } from '@expo/vector-icons';
import AddressInputField from '@/components/AddressInputField';
import MapPicker from '@/components/MapPicker';
import InputField from '@/components/InputField';
import InfoField from '@/components/InfoField';
import { AuthContext } from '@/contexts/AuthContext';
import { parse } from '@babel/core';
import { getReport, getReportPhotoBlob, updateReport } from '@/api/reportApi';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import {Report} from '@/types/report';
import { adminUpdateReport } from '@/api/adminApi';
import DropDownPicker from 'react-native-dropdown-picker';
import { postNotification } from '@/api/notificationsApi';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';


type EditReportProps = {
  report: Report;
  accessToken: string | null;
};

type ReportPhotoSource = {
  id: number,
  uri: string
}

const mock_report: Report = {
  id: 0,
  status: 'reported',
  report_datetime: '',
  published_datetime: '',
  note: '',
  admin_note: '',
  votes_pos: 0,
  votes_neg: 0,
  user: {
    id: 1,
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    created_datetime: ''
  },
  address: {
    id: 0,
    report_id: 0,
    building: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    latitude: '',
    longitude: ''
  },
  photos: []
}

const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;

export default function AdminReportView({ accessToken }: EditReportProps) {
  const user = useProtectedRoute();

  const { id } = useLocalSearchParams();
  const [ report, setReport ] = useState<Report>(mock_report);
  const reportIdRef = useRef(report.id);

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
  const [adminNote, setAdminNote] = useState(report.admin_note);
  const [open, setOpen] = useState(false);
  const [reportStatusValue, setReportStatusValue] = useState(report.status);
  const [reportStatus, setReportStatus] = useState([
    { label: 'Nahlásené', value: 'reported' },
    { label: 'Zamietnuté', value: 'cancelled' },
    { label: 'Opravené', value: 'resolved' },
    { label: 'Spracováva sa', value: 'in_progress' },
    { label: 'Zverejnené', value: 'published' },
  ]);
  const [reportPhotos, setReportPhotos] = useState<ReportPhotoSource[]>([]);

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const date = new Date(report.report_datetime);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  const formattedDate = `${day}.${month}.${year}`;

  const fetchReport = async () => {
    try {
      console.log("[ADMIN]: Retrieving report...")
      setReportPhotos([]);
      const res = await getReport(Number(id));
      if (res.data) {
        console.log(res.data);
        setReport(res.data);
        console.log("[ADMIN]: Retrieved report: ", res.data);
      }
    } catch (error: any){
      if (error.response) {
        console.error('[ADMIN] HTTP Error:', error.response.status);
        console.error('[ADMIN] Error details:', error.response.data);
        Toast.show({
          type: 'error',
          text1:  error.response.data.detail,
          text2: `Return code: ${error.response.status}`
        });
      } else if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`
        });
      } else {
        console.log("[ADMIN] ", error);
        Toast.show({
          type: 'error',
          text1: 'Unknown error.'
        });
      }
    }
  };

  const fetchImage = async (photoId: number) => {
    try {
      const res = await getReportPhotoBlob(photoId);
      console.log(res.status);
      if (res.status == 204){
        setReportPhotos(prevPhotos => [
          {
            id: photoId,
            uri: PlaceholderImage
          },
          ...prevPhotos,
        ]);
      } else {
        const blob = await res.data;
        const reader = new FileReader();
        reader.onloadend = () => {
          setReportPhotos(prevPhotos => [
            {
              id: photoId,
              uri: reader.result as string
            },
            ...prevPhotos,
          ]);
        };
        reader.readAsDataURL(blob);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404){
          console.log("[ADMIN] Photo not found")
          setReportPhotos(prevPhotos => [
            {
              id: photoId,
              uri: PlaceholderImage
            },
            ...prevPhotos,
          ]);
        } else {
          console.error('[ADMIN] HTTP Error:', error.response.status);
          console.error('[ADMIN] Error details:', error.response.data);
          Toast.show({
            type: 'error',
            text1:  error.response.data.detail,
            text2: `Return code: ${error.response.status}`
          });
        }
        
      } else if (error.request) {
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`
        });
      } else {
        console.log(error);
        Toast.show({
          type: 'error',
          text1: 'Unknown error.'
        });
      }
    }
  };

  const setupWS = async () => {
    const socket = new WebSocket("ws://192.168.240.23:8000/ws/update_report");
    socket.onopen = () => {
      console.log("[ADMIN-WS-ONOPEN]: WS connected");
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const rep_id = Number(data.report_id);
      console.log("[ADMIN-WS-ONMESSAGE]: report_id from message: ", rep_id);
      if (rep_id === reportIdRef.current)
        fetchReport();
    };
    socket.onerror = (error) => {
      console.log("[ADMIN-WS-ONERROR]: ", error);
    };
    socket.onclose = () => {
      console.log("[ADMIN-WS-ONCLOSE]: WS disconnected");
    };
    return () => {
      socket.close();
    };
  }

  useEffect(() => {
    fetchReport();
    setupWS();
  }, []);

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

    setAddress({
      building: report.address.building,
      street: report.address.street,
      city: report.address.city,
      state: report.address.state,
      postal_code: report.address.postal_code,
      country: report.address.country
    });
    setAddressText(fullAddress);
    setCoords({latitude: parseFloat(report.address.latitude), longitude: parseFloat(report.address.longitude)});
    setNote(report.note);
    setAdminNote(report.admin_note);
    setReportStatusValue(report.status);
    report.photos.map(photo => fetchImage(photo.id));
  }, [report]);

  useEffect(() => {
    reportIdRef.current = report.id;
  }, [report.id]);

  function getCurrentTimestamp(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    const timezoneOffset = -now.getTimezoneOffset();
    const timezoneHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
    const timezoneMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
    const timezoneSign = timezoneOffset >= 0 ? '+' : '-';

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}${timezoneSign}${timezoneHours}:${timezoneMinutes}`;
  }

  const handleSave = async () => {
    console.log('[ADMIN:save-report] Saving:', address, note, coords, adminNote);

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
        status: reportStatusValue,
        report_datetime: report.report_datetime,
        published_datetime: reportStatusValue === 'published' ? getCurrentTimestamp() : report.published_datetime,
        admin_note: adminNote,
        votes_pos: report.votes_pos,
        votes_neg: report.votes_neg,
      };

      if (reportStatusValue === 'resolved' || reportStatusValue === 'cancelled') {
        const title = reportStatusValue === 'cancelled' ? 'Hlásenie vymazané' : 'Zariadenie opravené';
        const note = reportStatusValue === 'cancelled' ? `Vaše hlásenie č. ${report.id} bolo vymazané` : `Vaše hlásenie č. ${report.id} bolo vyriešené`;
        try {
          const result = await postNotification(report.user.id, report.id, title, note);
        } catch (error: any) {
          if (error.response) {
            console.error('[ADMIN:save-report] HTTP Error:', error.response.status);
            console.error('[ADMIN:save-report] Error details:', error.response.data);
      
            Toast.show({
              type: 'error',
              text1:  error.response.data.detail,
              text2: `Return code: ${error.response.status}`
            });
          } else if (error.request) {
            console.error('[ADMIN:save-report] Request Error:', error.request);
            Toast.show({
              type: 'error',
              text1: 'Network error.',
              text2: `Please, check connection.`
            });
          } else {
            console.error('[ADMIN:save-report] Unknown error', error);
            Toast.show({
              type: 'error',
              text1: 'Unknown error.'
            });
          }
        }
      }

      const result = await adminUpdateReport(report.user.id, report.id, reportData);
      Toast.show({
        type: 'success',
        text1:  'Úspech',
        text2: 'Hlásenie bolo úspešne upravené'
      });
    } catch (error: any) {
      if (error.response) {
        console.error('[ADMIN:save-report] HTTP Error:', error.response.status);
        console.error('[ADMIN:save-report] Error details:', error.response.data);
        Toast.show({
          type: 'error',
          text1:  error.response.data.detail,
          text2: `Return code: ${error.response.status}`
        });
      } else if (error.request) {
        console.error('[ADMIN:save-report] Request Error:', error.request);
        Toast.show({
          type: 'error',
          text1: 'Network error.',
          text2: `Please, check connection.`
        });
      } else {
        console.error('[ADMIN:save-report] Unknown error', error);
        Toast.show({
          type: 'error',
          text1: 'Unknown error.'
        });
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

  const screenWidth = Dimensions.get('window').width;

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      backgroundColor: colors.background,
      flexGrow: 1,
    },
    header: {
      fontSize: isAccessibilityMode ? 22 * 1.25 : 22,
      fontWeight: '600',
      marginTop: 10,
      marginBottom: 20,
      color: colors.textPrimary,
    },
    image: {
      backgroundColor: colors.border,
      borderRadius: 10,
      width: screenWidth - 40,
      height: screenWidth - 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      borderRadius: 6,
      marginBottom: 20,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    textInfo: {
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.disabled,
      padding: 12,
      borderRadius: 6,
      flex: 1,
      marginRight: 10,
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: colors.accentBlue,
      padding: 12,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: isAccessibilityMode ? 14 * 1.25 : 14,
    },
    editButton: {
      flex: 1,
      marginBottom: 10,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    backButton: {
      position: 'absolute',
      top: 0,
      left: 10,
      zIndex: 10,
      padding: 8,
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
    dropdown: {
      borderWidth: 1,
      borderColor: colors.darkGrey,
      borderRadius: 8,
      padding: 10,
      backgroundColor: colors.lightGrey,
    },
    dropdownContainer: {
      backgroundColor: colors.lightGrey,
      borderColor: colors.darkGrey,
    },
    dropdownText: {
      fontSize: 16,
      backgroundColor: colors.lightGrey,
      color: colors.textPrimary,
      borderColor: colors.darkGrey,
    },
    dropdownLabel: {
      fontSize: 16,
      color: colors.textPrimary,
      borderColor: colors.darkGrey,
    },
    input: { flex: 1, color: colors.textPrimary, fontSize: isAccessibilityMode ? 16 * 1.25 : 16 },
  });

  if (activeView === 'main') {
    return (
      <ScrollView contentContainerStyle={styles.container} style={{ flex: 1, backgroundColor: colors.background }} nestedScrollEnabled={true}>
        <InfoField
          name='Nahlásené'
          value={formattedDate}
          style={{ marginBottom: 10, paddingHorizontal: 0, marginTop: 20 }}
        />
        <InfoField
          name='Adresa'
          value={`${report.address?.street === '' ? '' : `${report.address?.street} `}${report.address?.building === '' ? '' : `${report.address?.building} `}${report.address?.postal_code === '' ? '' : `${report.address?.postal_code} `}${report.address?.city}`}
          style={{ marginBottom: 10, paddingHorizontal: 0 }}
        />
        <InfoField name='Poznámka' value={report.note} style={{ marginBottom: 10, paddingHorizontal: 0 }} />
        <InfoField name='Vytvorené používateľom' value={report.user.email} style={{  marginBottom: 10, paddingHorizontal: 0 }} />
        <FlatList
          data={reportPhotos.length > 0 ? reportPhotos : [{id: 0, uri: PlaceholderImage}]}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          scrollEnabled
          showsHorizontalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: screenWidth - 40, marginBottom: 10 }}
          renderItem={({ item }) => (
            <View style={{ position: 'relative' }}>
              <Image
                style={styles.image}
                source={typeof item.uri === 'string' ? { uri: item.uri } : item.uri}
              />
            </View>
          )}
        />
        <TouchableOpacity onPress={() => setActiveView('edit')} style={styles.editButton}>
          <Text style={{ color: colors.textPrimary, marginVertical: 8, fontSize: isAccessibilityMode ? 18 * 1.25 : 18 }}>Upraviť hlásenie</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

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
        <Text style={styles.header}>Upraviť hlásenie</Text>
        <AddressInputField
          address={address}
          setAddress={setAddress}
          setCoords={setCoords}
          addressText={addressText}
          setAddressText={setAddressText}
          onMapPress={() => setActiveView('map')}
        />
        <View style={styles.inputContainer}>
          <Text style={{ position: 'absolute', marginLeft: 10, marginTop: -38, color: colors.textSecondary }}>Poznámka</Text>
          <TextInput
            style={[styles.input, { height: 40, paddingTop: 15 }]}
            placeholder="Pridať poznámku"
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={{ position: 'absolute', marginLeft: 10, marginTop: -38, color: colors.textSecondary }}>Poznámka administrátora</Text>
          <TextInput
            style={[styles.input, { height: 40, paddingTop: 15 }]}
            placeholder="Pridať poznámku"
            placeholderTextColor="#999"
            value={adminNote}
            onChangeText={setAdminNote}
            multiline
          />
        </View>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={reportStatusValue}
            items={reportStatus}
            setOpen={setOpen}
            setValue={setReportStatusValue}
            setItems={setReportStatus}
            style={styles.dropdown}
            flatListProps={{
              scrollEnabled: false,
            }}
            textStyle={styles.dropdownText}
            labelStyle={styles.dropdownLabel}
            dropDownContainerStyle={styles.dropdownContainer}
            ArrowUpIconComponent={({ style }) => (
              <Ionicons name="chevron-up" size={20} color={colors.textPrimary} />
            )}
            ArrowDownIconComponent={({ style }) => (
              <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
            )}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveView('main')}>
            <Text style={styles.buttonText}>Zrušiť</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={(handleSave)}>
            <Text style={styles.buttonText}>Uložiť</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
