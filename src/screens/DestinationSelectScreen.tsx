import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import type { Destination } from '../types';

interface DestinationSelectScreenProps {
  searchQuery: string;
  browseMode: boolean;
  results: Destination[];
  userLocation: { latitude: number; longitude: number } | null;
  onSelect: (destination: Destination) => void;
  onBack: () => void;
}

function BobbingMarker() {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -6, duration: 800, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [translateY]);

  return (
    <Animated.Text style={[styles.markerText, { transform: [{ translateY }] }]}>
      ▾
    </Animated.Text>
  );
}

export function DestinationSelectScreen({
  searchQuery,
  browseMode,
  results,
  userLocation,
  onSelect,
  onBack,
}: DestinationSelectScreenProps) {
  const [pendingPin, setPendingPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const selectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapPressIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (selectTimeoutRef.current) {
        clearTimeout(selectTimeoutRef.current);
      }
    };
  }, []);

  const region = useMemo(() => {
    if (results.length === 0 && userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      };
    }
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

  const handleMapPress = async (latitude: number, longitude: number) => {
    if (!browseMode) {
      return;
    }

    mapPressIdRef.current += 1;
    const pressId = mapPressIdRef.current;

    setPendingPin({ latitude, longitude });
    if (selectTimeoutRef.current) {
      clearTimeout(selectTimeoutRef.current);
      selectTimeoutRef.current = null;
    }

    let label = 'Pinned Location';
    let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const first = geocode[0];
        const parts = [first.name, first.street, first.city, first.region].filter(Boolean);
        label = first.name || first.street || label;
        address = parts.length > 0 ? parts.join(', ') : address;
      }
    } catch (e) {
      console.warn('reverseGeocodeAsync failed:', e);
    }

    // Ignore stale async responses from older taps.
    if (pressId !== mapPressIdRef.current) {
      return;
    }

    const selectedDestination: Destination = {
      id: `pin-${Date.now()}`,
      label,
      address,
      latitude,
      longitude,
    };

    // Briefly show the dropped pin before moving to the compass screen.
    selectTimeoutRef.current = setTimeout(() => {
      setPendingPin(null);
      onSelect(selectedDestination);
    }, 700);
  };

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

        <Text style={styles.heading}>{browseMode ? 'BROWSE MAP' : 'SELECT DESTINATION'}</Text>
        <Text style={styles.query}>
          {browseMode ? 'TAP ANYWHERE TO SELECT A DESTINATION' : `"${searchQuery}"`}
        </Text>

        <View style={styles.receiptDashes} />

        {(browseMode || results.length > 0) && (
          <View style={[styles.mapContainer, browseMode && styles.mapContainerBrowse]}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={region}
              customMapStyle={mapStyle}
              showsUserLocation={true}
              onPress={(event) => handleMapPress(event.nativeEvent.coordinate.latitude, event.nativeEvent.coordinate.longitude)}
            >
              {results.map((item, index) => (
                <Marker
                  key={item.id}
                  coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                  title={`${index + 1}. ${item.label}`}
                  description={item.address}
                  onCalloutPress={() => onSelect(item)}
                >
                  <BobbingMarker />
                </Marker>
              ))}
              {browseMode && pendingPin && (
                <Marker
                  coordinate={pendingPin}
                  title="Selected"
                >
                  <BobbingMarker />
                </Marker>
              )}
            </MapView>
          </View>
        )}

        {!browseMode && results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>NO RESULTS FOUND</Text>
            <Text style={styles.emptySubtext}>
              TRY A DIFFERENT ADDRESS
            </Text>
          </View>
        ) : !browseMode ? (
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
        ) : (
          <View style={styles.browseHelpContainer}>
            <Text style={styles.browseHelpText}>DROP A PIN BY TAPPING THE MAP</Text>
          </View>
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
  browseHelpContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  browseHelpText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    letterSpacing: 3,
    textAlign: 'center',
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
  mapContainerBrowse: {
    height: 360,
    marginTop: 12,
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  markerText: {
    fontSize: 64,
    color: theme.colors.primary,
    fontWeight: '700',
    height: 64,
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
