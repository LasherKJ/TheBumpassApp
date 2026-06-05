import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useKeepAwake } from 'expo-keep-awake';
import { theme } from '../theme';
import { CalcDistanceMeters, CalcInitialBearingDegrees } from '../utilities/haversine';
import type { Destination } from '../types';

const METERS_TO_MILES = 0.000621371;

interface CompassScreenProps {
  destination: Destination | null;
  userLocation: { latitude: number; longitude: number } | null;
  onBack: () => void;
}

export function CompassScreen({ destination, userLocation: initialLocation, onBack }: CompassScreenProps) {
  useKeepAwake();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(initialLocation);
  const [heading, setHeading] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const prevRotation = useRef(0);

  // Sync initial location from parent if local watch hasn't fired yet
  useEffect(() => {
    if (initialLocation && !userLocation) {
      setUserLocation(initialLocation);
    }
  }, [initialLocation]);

  // Watch user position
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (loc) => setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }),
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  // Watch device heading
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      sub = await Location.watchHeadingAsync((h) => {
        // trueHeading requires GPS fix; fall back to magnetometer heading
        setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
      });
    })();
    return () => { sub?.remove(); };
  }, []);

  // Compute bearing and distance
  const distance = destination && userLocation
    ? CalcDistanceMeters(userLocation.latitude, userLocation.longitude, destination.latitude, destination.longitude)
    : null;
  const bearing = destination && userLocation
    ? CalcInitialBearingDegrees(userLocation.latitude, userLocation.longitude, destination.latitude, destination.longitude)
    : null;

  // Animate compass rotation (bearing - device heading)
  useEffect(() => {
    const targetRotation = bearing !== null ? bearing - heading : 0;
    // Shortest-path rotation to avoid spinning the long way around
    let delta = targetRotation - prevRotation.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const newRotation = prevRotation.current + delta;
    prevRotation.current = newRotation;

    Animated.timing(rotateAnim, {
      toValue: newRotation,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [bearing, heading, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  const distanceDisplay = distance !== null
    ? `${(distance * METERS_TO_MILES).toFixed(1)} mi`
    : '-- mi';

  const bearingDisplay = bearing !== null
    ? `${Math.round(bearing)}°`
    : '--°';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>▲ CHANGE DESTINATION</Text>
        </TouchableOpacity>

        <View style={styles.receiptDashes} />

        {destination ? (
          <>
            <Text style={styles.destLabel}>{destination.label}</Text>
            <Text style={styles.destAddress}>{destination.address}</Text>
          </>
        ) : (
          <Text style={styles.destLabel}>NO DESTINATION</Text>
        )}

        <View style={styles.receiptDashes} />

        {/* Bearing readout */}
        <Text style={styles.bearingText}>BRG {bearingDisplay}</Text>

        {/* Compass */}
        <View style={styles.compassContainer}>
          <View style={styles.compassRing}>
            <Animated.Text style={[styles.compassArrow, { transform: [{ rotate: spin }] }]}>
              ↑
            </Animated.Text>
          </View>
        </View>

        {/* Distance display */}
        <View style={styles.distanceSection}>
          <Text style={styles.distanceValue}>{distanceDisplay}</Text>
          <Text style={styles.distanceLabel}>DISTANCE</Text>
        </View>

        <View style={styles.receiptDashes} />
        <Text style={styles.footer}>BUMPASS</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 32,
    paddingVertical: 8,
  },
  backText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 3,
  },
  receiptDashes: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.textSecondary,
    marginVertical: 8,
  },
  destLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 3,
    marginTop: 8,
    textAlign: 'center',
  },
  destAddress: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  bearingText: {
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    color: theme.colors.accent,
    letterSpacing: 4,
    textAlign: 'center',
    marginVertical: 4,
  },
  compassContainer: {
    marginVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassArrow: {
    fontFamily: theme.fonts.mono,
    fontSize: 180,
    color: theme.colors.accent,
  },
  distanceSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  distanceValue: {
    fontFamily: theme.fonts.mono,
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 4,
  },
  distanceLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    letterSpacing: 4,
    marginTop: 4,
  },
  footer: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textSecondary,
    letterSpacing: 6,
    opacity: 0.4,
    marginTop: 8,
  },
});
