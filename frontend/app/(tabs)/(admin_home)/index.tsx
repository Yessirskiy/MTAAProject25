import { Text, View, StyleSheet, Image, ScrollView, FlatList, RefreshControl, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, TextInput, Alert } from "react-native";
import { Link, router } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import FeedCard from "@/components/FeedCard";
import { useCallback, useEffect, useState } from "react";
import { getAdminFeed } from "@/api/feedApi";
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import type { Report as FeedCardReport } from '@/types/report';
import Toast from 'react-native-toast-message';

export default function Index() {
  const user = useProtectedRoute();
  const [feedReports, setFeedReports] = useState<FeedCardReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

  const fetchFeed = async () => {
    try {
      const res = await getAdminFeed();
      if (res.data.data) {
        console.log(res.data.data);
        setFeedReports(res.data.data);
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

  useEffect(() => {
    fetchFeed();
    const socket = new WebSocket("ws://147.175.163.6:8000/ws/new_report");

    socket.onopen = () => {
      console.log("WS connected");
    };

    socket.onmessage = (event) => {
      const data: FeedCardReport = JSON.parse(event.data);
      console.log("Message:", data);
      setFeedReports((prevReports) => [data, ...prevReports]);
    };

    socket.onerror = (error) => {
      console.log("WS error:", error);
    };

    socket.onclose = () => {
      console.log("WS disconnected");
    };

    return () => {
      socket.close();
    };
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

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{width: "100%"}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.feedContainer}>
          {feedReports.map((item) => (
            <FeedCard key={item.id} report={item} reactions={false} onHandlePress={() => router.push(`/(admin_home)/${item.id}`)}/>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
