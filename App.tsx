import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { VerticalPager, VerticalPagerRef } from './src/components/VerticalPager';
import { DestinationInputScreen } from './src/screens/DestinationInputScreen';
import { DestinationSelectScreen } from './src/screens/DestinationSelectScreen';
import { CompassScreen } from './src/screens/CompassScreen';
import { theme } from './src/theme';
import type { Destination } from './src/types';
import { getRecentDestinations, addRecentDestination } from './src/utilities/recentDestinations';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAX_RESULTS = 5;
const SEARCH_RADIUS = 50000; // 50 km

async function searchPlaces(
  query: string,
  userLocation: Location.LocationObjectCoords | null,
): Promise<Destination[]> {
  const params = new URLSearchParams({
    query,
    key: GOOGLE_MAPS_API_KEY,
  });

  if (userLocation) {
    params.set('location', `${userLocation.latitude},${userLocation.longitude}`);
    params.set('radius', String(SEARCH_RADIUS));
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results) {
    console.warn('Place search failed:', data.status, data.error_message);
    return [];
  }

  return data.results.slice(0, MAX_RESULTS).map((result: any, index: number) => ({
    id: result.place_id ?? String(index),
    label: result.name ?? query,
    address: result.formatted_address ?? '',
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
  }));
}

export default function App() {
  const pagerRef = useRef<VerticalPagerRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [recentDestinations, setRecentDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    getRecentDestinations().then(setRecentDestinations);
  }, []);

  const handleAddressSubmit = useCallback(async (address: string) => {
    setSearchQuery(address);
    try {
      const found = await searchPlaces(address, userLocation);
      setResults(found);
    } catch {
      Alert.alert('Error', 'Failed to search for that location.');
      setResults([]);
    }
    pagerRef.current?.scrollToPage(1);
  }, [userLocation]);

  const handleDestinationSelect = useCallback((destination: Destination) => {
    setSelectedDestination(destination);
    addRecentDestination(destination).then(setRecentDestinations);
    pagerRef.current?.scrollToPage(2);
  }, []);

  const handleBackToInput = useCallback(() => {
    pagerRef.current?.scrollToPage(0);
  }, []);

  const handleBackToSelect = useCallback(() => {
    pagerRef.current?.scrollToPage(1);
  }, []);

  return (
    <SafeAreaProvider>
    <View style={styles.container}>
      <StatusBar style="light" />
      <VerticalPager ref={pagerRef}>
        <DestinationInputScreen
          onSubmit={handleAddressSubmit}
          recentDestinations={recentDestinations}
          onSelectRecent={handleDestinationSelect}
        />
        <DestinationSelectScreen
          searchQuery={searchQuery}
          results={results}
          userLocation={userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null}
          onSelect={handleDestinationSelect}
          onBack={handleBackToInput}
        />
        <CompassScreen
          destination={selectedDestination}
          userLocation={userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null}
          onBack={handleBackToSelect}
        />
      </VerticalPager>
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Constants.statusBarHeight,
  },
});
