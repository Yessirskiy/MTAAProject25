import { Text, View, StyleSheet, Image, ScrollView, FlatList, RefreshControl } from "react-native";
import { Link } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import HomeStatisticsBox from "@/components/HomeStatisticsBox";
import FeedCard from "@/components/FeedCard";
import { useCallback, useEffect, useState } from "react";
import { getFeed } from "@/api/feedApi";
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';
import type { Report as FeedCardReport, ReportUser, ReportAddress } from '@/types/report';

const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;

export default function Index() {
  const user = useProtectedRoute();
  const [feedReports, setFeedReports] = useState<FeedCardReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const { isDarkMode } = UseTheme();
  const colors = getColors(isDarkMode);
  const { isAccessibilityMode } = UseTheme();

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

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
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
  }
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
            <FeedCard key={item.id} imgSource={PlaceholderImage} report={item}/>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
