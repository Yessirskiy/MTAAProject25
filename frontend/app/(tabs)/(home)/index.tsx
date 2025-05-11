import { Text, View, StyleSheet, Image, ScrollView, FlatList } from "react-native";
import { Link } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import HomeStatisticsBox from "@/components/HomeStatisticsBox";
import FeedCard from "@/components/FeedCard";
import { useEffect, useState } from "react";
import { getFeed } from "@/api/feedApi";

export type Report = {
  id: number;
  status: 'reported' | 'in_progress' | 'resolved'; // Extend as needed
  report_datetime: string; // ISO date string
  published_datetime: string;
  note: string;
  votes_pos: number;
  votes_neg: number;
  user: ReportUser;
  address: ReportAddress;
  photos: ReportPhoto[];
};

export type ReportUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_datetime: string;
};

export type ReportAddress = {
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

export type ReportPhoto = {
  id: number;
  report_id: number;
};

const PlaceholderImage: string = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;

export default function Index() {
  const user = useProtectedRoute();
  if (!user) return null;

  const [feedReports, setFeedReports] = useState<Report[]>([]);
  
  useEffect(() => {
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

    fetchFeed();
  }, []);

  return (
    <View style={styles.container}>
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
          <FlatList
            data={feedReports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (<FeedCard imgSource={PlaceholderImage}/>)}
          />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    gap: 20,
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
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
    backgroundColor: 'black',
    opacity: 0.6,
    marginHorizontal: 8,
  },
  sectionText: {
    fontSize: 20,
  },
  feedContainer: {
    flex: 1,
    marginHorizontal: 20,
    alignSelf: 'stretch',
  }
});