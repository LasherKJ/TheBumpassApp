import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import type { Destination } from '../types';

interface DestinationInputScreenProps {
  onSubmit: (address: string) => void;
  recentDestinations?: Destination[];
  onSelectRecent?: (destination: Destination) => void;
}

export function DestinationInputScreen({ onSubmit, recentDestinations = [], onSelectRecent }: DestinationInputScreenProps) {
  const [address, setAddress] = useState('');

  const handleGo = () => {
    const trimmed = address.trim();
    if (trimmed.length > 0) {
      onSubmit(trimmed);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Receipt-style header */}
        <View style={styles.receiptDashes} />
        <Text style={styles.title}>BUMPASS</Text>
        <Text style={styles.subtitle}>WHERE ARE YOU HEADED?</Text>
        <View style={styles.receiptDashes} />

        <View style={styles.inputSection}>
          <Text style={styles.label}>ENTER DESTINATION</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="123 Main St, City, State"
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="go"
            onSubmitEditing={handleGo}
            autoCorrect={false}
            keyboardAppearance="dark"
          />
        </View>

        <TouchableOpacity
          style={[styles.goButton, !address.trim() && styles.goButtonDisabled]}
          onPress={handleGo}
          disabled={!address.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.goButtonText}>▼ FIND IT ▼</Text>
        </TouchableOpacity>

        {recentDestinations.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.receiptDashes} />
            <Text style={styles.recentHeading}>RECENT</Text>
            <ScrollView style={styles.recentList} showsVerticalScrollIndicator={false}>
              {recentDestinations.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && (
                    <Text style={styles.separator}>· · · · · · · · · · · · · ·</Text>
                  )}
                  <TouchableOpacity
                    style={styles.recentItem}
                    onPress={() => onSelectRecent?.(item)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.recentIndex}>{String(index + 1).padStart(2, '0')}</Text>
                    <View style={styles.recentContent}>
                      <Text style={styles.recentLabel}>{item.label}</Text>
                      <Text style={styles.recentAddress}>{item.address}</Text>
                    </View>
                    <Text style={styles.recentArrow}>▼</Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.scrollHint}>
          <Text style={styles.scrollHintText}>▽</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptDashes: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.textSecondary,
    marginVertical: 8,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 12,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  inputSection: {
    width: '100%',
    marginTop: 48,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    letterSpacing: 3,
    marginBottom: 12,
  },
  input: {
    fontFamily: theme.fonts.mono,
    fontSize: 16,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    paddingVertical: 12,
    width: '100%',
  },
  goButton: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  goButtonDisabled: {
    borderColor: theme.colors.divider,
    opacity: 0.4,
  },
  goButtonText: {
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    color: theme.colors.accent,
    letterSpacing: 4,
  },
  scrollHint: {
    position: 'absolute',
    bottom: 40,
  },
  scrollHintText: {
    fontFamily: theme.fonts.mono,
    fontSize: 24,
    color: theme.colors.textSecondary,
    opacity: 0.4,
  },
  recentSection: {
    width: '100%',
    marginTop: 32,
  },
  recentHeading: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 4,
    marginBottom: 4,
  },
  recentList: {
    maxHeight: 200,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentIndex: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 16,
  },
  recentContent: {
    flex: 1,
  },
  recentLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
  },
  recentAddress: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  recentArrow: {
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    color: theme.colors.accent,
    marginLeft: 12,
  },
  separator: {
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 2,
    opacity: 0.4,
  },
});
