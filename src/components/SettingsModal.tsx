import React, { useEffect, useMemo, useState } from 'react';
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
import { useTheme } from '../theme';

const UNITS_STORAGE_KEY = 'distance_units';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { theme, themePreference, setColorScheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
          <Text style={styles.label}>COLOR THEME</Text>
          <View style={styles.unitsToggle}>
            {(['dark', 'light', 'auto'] as const).map((scheme) => {
              const selected = themePreference === scheme;
              return (
                <TouchableOpacity
                  key={scheme}
                  style={[styles.unitOption, selected && styles.unitOptionSelected]}
                  onPress={() => setColorScheme(scheme)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.unitOptionText, selected && styles.unitOptionTextSelected]}>
                    {scheme.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.label, styles.sectionLabel]}>DISTANCE UNITS</Text>
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

function createStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  panel: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.accent,
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
    color: theme.colors.textSecondary,
    letterSpacing: 3,
    marginBottom: 12,
  },
  sectionLabel: {
    marginTop: 20,
  },
  unitsToggle: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  unitOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  unitOptionSelected: {
    backgroundColor: theme.colors.accent,
  },
  unitOptionText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
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
    color: theme.colors.accent,
    letterSpacing: 3,
  },
  });
}
