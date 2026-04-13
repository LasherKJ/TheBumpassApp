import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme';

interface DestinationInputScreenProps {
  onSubmit: (address: string) => void;
}

export function DestinationInputScreen({ onSubmit }: DestinationInputScreenProps) {
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
});
