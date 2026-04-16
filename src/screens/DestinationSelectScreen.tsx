import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import type { Destination } from '../types';

interface DestinationSelectScreenProps {
  searchQuery: string;
  results: Destination[];
  userLocation: { latitude: number; longitude: number } | null;
  onSelect: (destination: Destination) => void;
  onBack: () => void;
}

export function DestinationSelectScreen({
  searchQuery,
  results,
  userLocation,
  onSelect,
  onBack,
}: DestinationSelectScreenProps) {
  const region = useMemo(() => {
    if (results.length === 0 && !userLocation) {
      return { latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.1, longitudeDelta: 0.1 };
    }
    const lats = results.map((r) => r.latitude);
    const lngs = results.map((r) => r.longitude);
    if (userLocation) {
      lats.push(userLocation.latitude);
      lngs.push(userLocation.longitude);
    }
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [results, userLocation]);

  const renderItem = ({ item, index }: { item: Destination; index: number }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onSelect(item)}
      activeOpacity={0.6}
    >
      <Text style={styles.resultIndex}>{String(index + 1).padStart(2, '0')}</Text>
      <View style={styles.resultContent}>
        <Text style={styles.resultLabel}>{item.label}</Text>
        <Text style={styles.resultAddress}>{item.address}</Text>
      </View>
      <Text style={styles.resultArrow}>▼</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.receiptDashes} />

        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>▲ BACK</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>SELECT DESTINATION</Text>
        <Text style={styles.query}>"{searchQuery}"</Text>

        <View style={styles.receiptDashes} />

        {results.length > 0 && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={region}
              customMapStyle={mapStyle}
              showsUserLocation={true}
            >
              {results.map((item, index) => (
                <Marker
                  key={item.id}
                  coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                  title={`${index + 1}. ${item.label}`}
                  description={item.address}
                  onCalloutPress={() => onSelect(item)}
                >
                  <Text style={{ fontSize: 64, color: theme.colors.primary, fontWeight: '700', borderWidth: 1, borderColor: 'blue', height: 64 }}>▾</Text>
                </Marker>
              ))}
            </MapView>
          </View>
        )}

        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>NO RESULTS FOUND</Text>
            <Text style={styles.emptySubtext}>
              TRY A DIFFERENT ADDRESS
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {results.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <Text style={styles.separator}>· · · · · · · · · · · · · ·</Text>
                )}
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.resultIndex}>{String(index + 1).padStart(2, '0')}</Text>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultLabel}>{item.label}</Text>
                    <Text style={styles.resultAddress}>{item.address}</Text>
                  </View>
                  <Text style={styles.resultArrow}>▼</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </ScrollView>
        )}

        <View style={styles.scrollHint}>
          <Text style={styles.scrollHintText}>▽</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  receiptDashes: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.textSecondary,
    marginVertical: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 3,
  },
  heading: {
    fontFamily: theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: 8,
  },
  query: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.accent,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  list: {
    flex: 1,
    marginTop: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  resultIndex: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
  },
  resultAddress: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  resultArrow: {
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    color: theme.colors.accent,
    marginLeft: 12,
  },
  separator: {
    fontFamily: theme.fonts.mono,
    color: theme.colors.divider,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    color: theme.colors.textSecondary,
    letterSpacing: 4,
  },
  emptySubtext: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 8,
    opacity: 0.6,
  },
  scrollHint: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  scrollHintText: {
    fontFamily: theme.fonts.mono,
    fontSize: 24,
    color: theme.colors.textSecondary,
    opacity: 0.4,
  },
  mapContainer: {
    height: 200,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider,
    marginTop: 8,
    marginBottom: 8,
  },
  map: {
    flex: 1,
  },
});

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1A1A1A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0D0D' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8A8278' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2A2520' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8A8278' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D0D0D' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];
