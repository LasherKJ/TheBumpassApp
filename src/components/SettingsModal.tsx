import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

const UNITS_STORAGE_KEY = 'distance_units';

const settingsColors = {
  secondaryText: '#DDD5C8',
  buttonBorder: '#F2D8A0',
  buttonText: '#FFF0CC',
};

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const [units, setUnits] = useState<'mi' | 'km'>('mi');
  const [unitsLoaded, setUnitsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(UNITS_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'mi' || saved === 'km') {
          setUnits(saved);
        }
      })
      .catch(() => {
        Alert.alert('Settings unavailable', 'Could not load your distance unit preference.');
      })
      .finally(() => setUnitsLoaded(true));
  }, []);

  const handleSelectUnits = async (nextUnits: 'mi' | 'km') => {
    try {
      await AsyncStorage.setItem(UNITS_STORAGE_KEY, nextUnits);
      setUnits(nextUnits);
    } catch {
      Alert.alert('Settings not saved', 'Could not save your distance unit preference.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close settings"
        />
        <View style={styles.panel}>
          <Text style={styles.title}>SETTINGS</Text>
          <Text style={styles.label}>DISTANCE UNITS</Text>
          <View style={styles.unitsToggle}>
            {(['mi', 'km'] as const).map((unit) => {
              const selected = units === unit;
              return (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitOption, selected && styles.unitOptionSelected]}
                  onPress={() => handleSelectUnits(unit)}
                  disabled={!unitsLoaded}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, disabled: !unitsLoaded }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.unitOptionText, selected && styles.unitOptionTextSelected]}>
                    {unit === 'mi' ? 'MILES' : 'KILOMETERS'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.doneText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  panel: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: settingsColors.buttonBorder,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 4,
    marginBottom: 24,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: settingsColors.secondaryText,
    letterSpacing: 3,
    marginBottom: 12,
  },
  unitsToggle: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: settingsColors.buttonBorder,
  },
  unitOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  unitOptionSelected: {
    backgroundColor: settingsColors.buttonBorder,
  },
  unitOptionText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: settingsColors.secondaryText,
    letterSpacing: 1,
  },
  unitOptionTextSelected: {
    color: theme.colors.background,
    fontWeight: '700',
  },
  doneButton: {
    alignSelf: 'flex-end',
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: settingsColors.buttonText,
    letterSpacing: 3,
  },
});
