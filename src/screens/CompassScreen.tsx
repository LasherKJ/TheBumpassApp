import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { CalcDistanceMeters, CalcInitialBearingDegrees } from '../utilities/haversine';
import type { Destination } from '../types';

const METERS_TO_MILES = 0.000621371;
const METERS_TO_KM = 0.001;
const UNITS_STORAGE_KEY = 'distance_units';

interface CompassScreenProps {
  destination: Destination | null;
  userLocation: { latitude: number; longitude: number } | null;
  onBack: () => void;
}

export function CompassScreen({ destination, userLocation: initialLocation, onBack }: CompassScreenProps) {
  useKeepAwake();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(initialLocation);
  const [heading, setHeading] = useState(0);
  const [headingSource, setHeadingSource] = useState<'magnetic' | 'gps' | null>(null);
  const [headingStatus, setHeadingStatus] = useState<'ok' | 'uncalibrated' | 'stuck' | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [units, setUnits] = useState<'mi' | 'km'>('mi');
  const lastHeadingValue = useRef<number | null>(null);
  const lastHeadingChangeAt = useRef(Date.now());
  const headingAccuracy = useRef<number | null>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const prevRotation = useRef(0);

  // Sync initial location from parent if local watch hasn't fired yet
  useEffect(() => {
    if (initialLocation && !userLocation) {
      setUserLocation(initialLocation);
    }
  }, [initialLocation]);

  // Load the saved distance-unit preference
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(UNITS_STORAGE_KEY);
      if (saved === 'mi' || saved === 'km') {
        setUnits(saved);
      }
    })();
  }, []);
  // Watch user position
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1, timeInterval: 1000 },
        (loc) => setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }),
      );
      if (cancelled) sub.remove();
    })();
    return () => { cancelled = true; sub?.remove(); };
  }, []);

  // Watch device heading
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      try {
        sub = await Location.watchHeadingAsync((h) => {
          // trueHeading requires GPS fix; fall back to magnetometer heading
          const value = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          setHeading(value);
          setHeadingSource('magnetic');

          // expo accuracy: 0 none, 1 low, 2 medium, 3 high (lower = needs calibration)
          headingAccuracy.current = h.accuracy ?? null;

          // Track when the heading value actually changes (for stuck detection).
          // Use shortest angular difference so the 0/360 wrap isn't counted as movement.
          if (lastHeadingValue.current === null) {
            lastHeadingChangeAt.current = Date.now();
          } else {
            let delta = Math.abs(value - lastHeadingValue.current);
            if (delta > 180) delta = 360 - delta;
            if (delta > 0.5) lastHeadingChangeAt.current = Date.now();
          }
          lastHeadingValue.current = value;
        });
        if (cancelled) sub.remove();
      } catch (e) {
        console.warn('watchHeadingAsync failed:', e);
        // No magnetometer available; arrow only turns as GPS position changes
        setHeadingSource('gps');
      }
    })();
    return () => { cancelled = true; sub?.remove(); };
  }, []);

  // Periodically classify the magnetometer health for the debug message
  useEffect(() => {
    const id = setInterval(() => {
      if (headingSource === 'gps') return;
      if (lastHeadingValue.current === null) {
        setHeadingStatus(null);
        return;
      }
      const acc = headingAccuracy.current;
      const frozenMs = Date.now() - lastHeadingChangeAt.current;
      if (acc !== null && acc >= 0 && acc < 2) {
        // Low/no calibration reported by the sensor
        setHeadingStatus('uncalibrated');
      } else if (frozenMs > 5000) {
        // Events arriving but the value hasn't moved -> sensor is stuck
        setHeadingStatus('stuck');
      } else {
        setHeadingStatus('ok');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [headingSource]);

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
    inputRange: [-36000, 36000],
    outputRange: ['-36000deg', '36000deg'],
  });

  const distanceDisplay = distance !== null
    ? `${(distance * (units === 'mi' ? METERS_TO_MILES : METERS_TO_KM)).toFixed(1)} ${units}`
    : `-- ${units}`;

  const bearingDisplay = bearing !== null
    ? `${Math.round(bearing)}°`
    : '--°';

  // Long-press the arrow to toggle the heading-source debug message
  const handleArrowLongPress = () => {
    setShowDebug((prev) => !prev);
  };

  // Tap the distance to toggle units and persist the choice
  const handleToggleUnits = () => {
    setUnits((prev) => {
      const next = prev === 'mi' ? 'km' : 'mi';
      AsyncStorage.setItem(UNITS_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  };
  const debugMessage = headingSource === 'gps'
    ? 'SRC: GPS MOTION (NO COMPASS)'
    : headingStatus === 'uncalibrated'
    ? 'COMPASS UNCALIBRATED'
    : headingStatus === 'stuck'
    ? 'COMPASS STUCK / NOT UPDATING'
    : headingStatus === 'ok'
    ? 'SRC: MAGNETIC COMPASS (OK)'
    : 'SRC: WAITING...';

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
            <Pressable onLongPress={handleArrowLongPress}>
              <Animated.Text style={[styles.compassArrow, { transform: [{ rotate: spin }] }]}>
                ↑
              </Animated.Text>
            </Pressable>
          {showDebug && <Text style={styles.debugText}>{debugMessage}</Text>}
          </View>
        </View>

        {/* Distance display */}
        <TouchableOpacity onPress={handleToggleUnits} style={styles.distanceSection}>
          <Text style={styles.distanceValue}>{distanceDisplay}</Text>
          <Text style={styles.distanceLabel}>DISTANCE</Text>
        </TouchableOpacity>

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
  debugText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    marginTop: 12,
    textAlign: 'center',
    position: 'absolute',
    bottom: -10,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderStyle: 'dashed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.background,
    
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
