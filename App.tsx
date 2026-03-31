import React, { useRef, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { VerticalPager, VerticalPagerRef } from './src/components/VerticalPager';
import { DestinationInputScreen } from './src/screens/DestinationInputScreen';
import { DestinationSelectScreen } from './src/screens/DestinationSelectScreen';
import { CompassScreen } from './src/screens/CompassScreen';
import { theme } from './src/theme';
import type { Destination } from './src/types';

// Placeholder results — will be replaced with real geocoding later
function makeMockResults(query: string): Destination[] {
  return [
    {
      id: '1',
      label: query,
      address: query,
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: '2',
      label: `Near ${query}`,
      address: `Somewhere close to ${query}`,
      latitude: 37.775,
      longitude: -122.42,
    },
  ];
}

export default function App() {
  const pagerRef = useRef<VerticalPagerRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const handleAddressSubmit = useCallback((address: string) => {
    setSearchQuery(address);
    setResults(makeMockResults(address));
    pagerRef.current?.scrollToPage(1);
  }, []);

  const handleDestinationSelect = useCallback((destination: Destination) => {
    setSelectedDestination(destination);
    pagerRef.current?.scrollToPage(2);
  }, []);

  const handleBackToInput = useCallback(() => {
    pagerRef.current?.scrollToPage(0);
  }, []);

  const handleBackToSelect = useCallback(() => {
    pagerRef.current?.scrollToPage(1);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <VerticalPager ref={pagerRef}>
        <DestinationInputScreen onSubmit={handleAddressSubmit} />
        <DestinationSelectScreen
          searchQuery={searchQuery}
          results={results}
          onSelect={handleDestinationSelect}
          onBack={handleBackToInput}
        />
        <CompassScreen
          destination={selectedDestination}
          onBack={handleBackToSelect}
        />
      </VerticalPager>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Constants.statusBarHeight,
  },
});
