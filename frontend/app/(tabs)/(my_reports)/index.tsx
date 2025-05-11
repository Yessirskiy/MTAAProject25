import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { getUserReportsMe } from '@/api/userApi';
import { getReportPhoto } from '@/api/reportApi';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import FastImage from 'react-native-fast-image'
import { AuthContext } from '@/contexts/AuthContext';
import MapPicker from '@/components/MapPicker';
import AddressInputField from '@/components/AddressInputField';
import EditReport from '@/components/EditReport';
import { useFocusEffect } from 'expo-router';


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
      } catch (err) {
        console.error('Failed to fetch report:', err);
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

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={item.status === 'resolved' ? 1 : 0.2}
            onPress={() => {
              if (item.status !== 'resolved') {
                setSelectedReport(item);
                setActiveView('edit');
              }
            }}
          >
            <Image
              style={styles.image}
              source={{
                uri: item.photoUri || undefined,
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }}
            />
            <View style={styles.info}>
              <Text style={styles.title}>
                {item.address?.street === '' ? '' : `${item.address?.street} `}{item.address?.building === '' ? '' : `${item.address?.building} `}{item.address?.postal_code === '' ? '' : `${item.address?.postal_code} `}{item.address?.city}
              </Text>
              <Text numberOfLines={2} style={styles.note}>{item.note}</Text>
              <Text style={styles.id}>Hlásenie č. {item.id}</Text>
              <Text style={styles.status}>{getStatusLabel(item.status)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    margin: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  note: {
    color: '#333',
    marginTop: 4,
  },
  id: {
    color: '#888',
    marginTop: 6,
  },
  status: {
    backgroundColor: '#ddd',
    padding: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  editContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginTop: 40,
    backgroundColor: '#333',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
});
