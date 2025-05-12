import { Text, View, StyleSheet, Image, ScrollView, FlatList, RefreshControl, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, TextInput, Alert } from "react-native";
import { Link } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import HomeStatisticsBox from "@/components/HomeStatisticsBox";
import FeedCard from "@/components/FeedCard";
import { useCallback, useContext, useEffect, useState } from "react";
import { getFeed } from "@/api/feedApi";
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import type { Report as FeedCardReport, ReportUser, ReportAddress } from '@/types/report';
import { AuthContext } from "@/contexts/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import AddressInputField from '@/components/AddressInputField';
import MapPicker from '@/components/MapPicker';
import InfoField from '@/components/InfoField';
import { adminUpdateReport } from "@/api/adminApi";
import AdminEditReport from "@/components/AdminEditReport";


const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;

const enum StatusEnum {
  Reported = "reported",
  Published = "published",
  InProgress = "in_progress",
  Resolved = "resolved",
  Cancelled = "cancelled",
}

export default function Index() {
  const user = useProtectedRoute();
  const [feedReports, setFeedReports] = useState<FeedCardReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { accessToken } = useContext(AuthContext);

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();
  const [selectedReport, setSelectedReport] = useState<FeedCardReport | null>(null);

  const [activeView, setActiveView] = useState<'main' | 'inspect'>('main');

  const fetchFeed = async () => {
    try {
      const res = await getFeed();
      if (res.data.data) {
        console.log(res.data.data);
        setFeedReports(res.data.data);
      }
    } catch (error: any){

    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = useCallback(async () => {
      setRefreshing(true);
      fetchFeed();
      setRefreshing(false);
    }, []);

  if (!user) return null;

  const screenWidth = Dimensions.get('window').width;

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  mainContainer: {
    padding: 20,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    gap: 20,
    marginHorizontal: 20,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textPrimary,
    opacity: 0.6,
    marginHorizontal: 8,
  },
  sectionText: {
    fontSize: isAccessibilityMode ? 20 * 1.25 : 20,
    color: colors.textSecondary,
  },
  feedContainer: {
    flex: 1,
    marginHorizontal: 20,
    alignSelf: 'stretch',
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
  input: { flex: 1, color: colors.textPrimary, fontSize: isAccessibilityMode ? 16 * 1.25 : 16 },
  });

  if (activeView === 'inspect') {

    if (selectedReport) {

      return (
        <AdminEditReport
          report={selectedReport}
          onGoBack={() => {
            setSelectedReport(null);
            setActiveView('main');
          }}
          accessToken={accessToken}
        />
      )
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <HomeStatisticsBox 
            upperText="V tomto roku ste zaslali" 
            statisticText="06" 
            bottomText="hlásení"
            containerStyle={{flexShrink: 1}}
          />
          <HomeStatisticsBox 
            upperText="V tomto roku sme opravili" 
            statisticText="17" 
            bottomText="zariadení"
            containerStyle={{flexShrink: 1}}
          />
        </View>
        <View style={styles.sectionHeader}>
          <View style={styles.line} />
          <Text style={styles.sectionText}>Hlásenia vo vašom okolí</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.feedContainer}>
          {feedReports.map((item) => (
            <FeedCard key={item.id} imgSource={PlaceholderImage} report={item} onHandlePress={() => {setSelectedReport(item); setActiveView('inspect')}}/>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
