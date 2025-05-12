import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList, Alert, ScrollView } from 'react-native';
import { getUserReportsMe } from '@/api/userApi';
import { getReportPhoto } from '@/api/reportApi';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import FastImage from 'react-native-fast-image'
import { AuthContext } from '@/contexts/AuthContext';
import MapPicker from '@/components/MapPicker';
import AddressInputField from '@/components/AddressInputField';
import EditReport from '@/components/EditReport';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import * as Device from 'expo-device';


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


export default function MyReportsScreen() {
  const user = useProtectedRoute();
  const { accessToken } = useContext(AuthContext);
  if (!user) return null;

  const [activeView, setActiveView] = useState<'list' | 'edit'>('list');
  const [selectedReport, setSelectedReport] = useState<ReportWithPhoto | null>(null);
  const [reports, setReports] = useState<ReportWithPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  const fetchReports = async () => {
      try {
        const response = await getUserReportsMe();
        const data: Report[] = response.data.data;

        const reportsWithPhotos = await Promise.all(
          data.map(async (report: Report) => {
            let photoUri = null;

            const firstPhotoId = report.photos?.[0]?.id;
            if (firstPhotoId) {
              photoUri = `${process.env.EXPO_PUBLIC_BASE_URL}/report/photo/${firstPhotoId}`;
            }

            return { ...report, photoUri };
          })
        );
        
        //console.log(reports);

        setReports(reportsWithPhotos);
      } catch (err: any) {
        if (err.request) {
          Toast.show({
            type: 'error',
            text1: 'Network error.',
            text2: `Please, check connection.`
          });
        }
        else {
          console.error('Failed to fetch report:', err);
        }
      } finally {
        setLoading(false);
      }
    };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  interface StatusLabels {
    [key: string]: string;
  }

  const getStatusLabel = (status: string): string => {
    const statusLabels: StatusLabels = {
      reported: 'Nahlásené',
      published: 'Zverejnené',
      in_progress: 'Spracováva sa',
      resolved: 'Opravené',
      cancelled: 'Zamietnuté',
    };

    return statusLabels[status] || 'Unknown state';
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
  }

  if (activeView === 'edit') {
    return (
      <EditReport
        report={selectedReport as ReportWithPhoto}
        onGoBack={() => {
          fetchReports();
          setSelectedReport(null);
          setActiveView('list');
        }}
        accessToken={accessToken}
      />
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      fontSize: isAccessibilityMode ? 24 * 1.25 : 24,
      fontWeight: '600',
      textAlign: 'center',
      marginVertical: 16,
    },
    card: {
      flexDirection: 'row',
      padding: 12,
      margin: 8,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    image: {
      width: isAccessibilityMode ? 125 : 100,
      height: isAccessibilityMode ? 125 : 100,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    tabletImage: {
      width: isAccessibilityMode ? 150 * 1.25 : 150,
      height: isAccessibilityMode ? 150 * 1.25 : 150,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    info: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      fontWeight: 'bold',
      fontSize: isAccessibilityMode ? 16 * 1.25 : 16,
      color: colors.textPrimary
    },
    tabletTitle: {
      fontWeight: 'bold',
      fontSize: isAccessibilityMode ? 26 * 1.25 : 26,
      color: colors.textPrimary
    },
    note: {
      color: colors.darkGrey,
      marginTop: 4,
      fontSize: isAccessibilityMode ? 14 * 1.25 : 14,
    },
    tabletNote: {
      color: colors.darkGrey,
      marginTop: 4,
      fontSize: isAccessibilityMode ? 24 * 1.25 : 24,
    },
    id: {
      color: colors.icon,
      marginTop: 6,
      fontSize: isAccessibilityMode ? 14 * 1.25 : 14,
    },
    tabletId: {
      color: colors.icon,
      marginTop: 6,
      fontSize: isAccessibilityMode ? 24 * 1.25 : 24,
    },
    status: {
      backgroundColor: colors.buttonBackground,
      padding: 4,
      borderRadius: 6,
      marginTop: 6,
      alignSelf: 'flex-start',
      color: colors.icon,
      fontSize: isAccessibilityMode ? 14 * 1.25 : 14,
    },
    tabletStatus: {
      backgroundColor: colors.buttonBackground,
      padding: 4,
      borderRadius: 6,
      marginTop: 6,
      alignSelf: 'flex-start',
      color: colors.icon,
      fontSize: isAccessibilityMode ? 24 * 1.25 : 24,
    },
    editContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    backButton: {
      marginTop: 40,
      backgroundColor: colors.darkGrey,
      padding: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
  });

  return (
    <View style={styles.container}>
      {reports.length > 0 ? (
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={item.status === 'resolved' || item.status === 'cancelled' ? 1 : 0.2}
            onPress={() => {
              if (item.status !== 'resolved') {
                setSelectedReport(item);
                setActiveView('edit');
              }
            }}
          >
            <Image
              style={isTablet ? styles.tabletImage : styles.image}
              source={{
                uri: item.photoUri || undefined,
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }}
            />
            <View style={styles.info}>
              <Text style={isTablet ? styles.tabletTitle : styles.title}>
                {item.address?.street === '' ? '' : `${item.address?.street} `}{item.address?.building === '' ? '' : `${item.address?.building} `}{item.address?.postal_code === '' ? '' : `${item.address?.postal_code} `}{item.address?.city}
              </Text>
              <Text numberOfLines={2} style={isTablet ? styles.tabletNote : styles.note}>{item.note}</Text>
              <Text style={isTablet ? styles.tabletId : styles.id}>Hlásenie č. {item.id}</Text>
              <Text style={isTablet ? styles.tabletStatus : styles.status}>{getStatusLabel(item.status)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 300, fontSize: isAccessibilityMode ? 16 * 1.25 : 16 }}>Zatiaľ ste nezverejnili žiadne hlásenia</Text>
      )}
    </View>
  );
}
