import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

const MapScreen: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to show your location.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = loc.coords;
      setLocation(coords);

      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
    })();
  }, []);

  if (!region || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <MapView
      style={styles.map}
      region={region}
      showsUserLocation
    >
    </MapView>
  );
}

export default MapScreen;

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
