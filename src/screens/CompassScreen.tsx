import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { theme } from '../theme';
import type { Destination } from '../types';

interface CompassScreenProps {
  destination: Destination | null;
  onBack: () => void;
}

export function CompassScreen({ destination, onBack }: CompassScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>▲ CHANGE DESTINATION</Text>
        </TouchableOpacity>

        <Text style={styles.receiptDashes}>- - - - - - - - - - - - - - -</Text>

        {destination ? (
          <>
            <Text style={styles.destLabel}>{destination.label}</Text>
            <Text style={styles.destAddress}>{destination.address}</Text>
          </>
        ) : (
          <Text style={styles.destLabel}>NO DESTINATION</Text>
        )}

        <Text style={styles.receiptDashes}>- - - - - - - - - - - - - - -</Text>

        {/* Compass placeholder */}
        <View style={styles.compassContainer}>
          <View style={styles.compassRing}>
            <Text style={styles.compassArrow}>↑</Text>
          </View>
        </View>

        {/* Distance display */}
        <View style={styles.distanceSection}>
          <Text style={styles.distanceValue}>-- mi</Text>
          <Text style={styles.distanceLabel}>DISTANCE</Text>
        </View>

        <Text style={styles.receiptDashes}>- - - - - - - - - - - - - - -</Text>
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
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    fontSize: 14,
    letterSpacing: 4,
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
  compassContainer: {
    marginVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassArrow: {
    fontFamily: theme.fonts.mono,
    fontSize: 64,
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
