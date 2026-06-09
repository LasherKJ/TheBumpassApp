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

const inputScreenColors = {
  line: '#C8C0B3',
  secondaryText: '#DDD5C8',
  buttonBorder: '#F2D8A0',
  buttonText: '#FFF0CC',
};

interface DestinationInputScreenProps {
  onSubmit: (address: string) => void;
  onBrowseMap: () => void;
  recentDestinations?: Destination[];
  onSelectRecent?: (destination: Destination) => void;
}

export function DestinationInputScreen({ onSubmit, onBrowseMap, recentDestinations = [], onSelectRecent }: DestinationInputScreenProps) {
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
            placeholderTextColor={inputScreenColors.secondaryText}
            returnKeyType="go"
            onSubmitEditing={handleGo}
            autoCorrect={false}
            keyboardAppearance="dark"
          />
        </View>

        <TouchableOpacity
          style={styles.goButton}
          onPress={handleGo}
          disabled={!address.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.goButtonText}>▼ FIND IT ▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.browseButton}
          onPress={onBrowseMap}
          activeOpacity={0.7}
        >
          <Text style={styles.browseButtonText}>BROWSE THE MAP</Text>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  receiptDashes: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: inputScreenColors.line,
    marginVertical: 8,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 12,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: inputScreenColors.secondaryText,
    letterSpacing: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  inputSection: {
    width: '100%',
    marginTop: 32,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: inputScreenColors.secondaryText,
    letterSpacing: 3,
    marginBottom: 12,
  },
  input: {
    fontFamily: theme.fonts.mono,
    fontSize: 16,
    color: theme.colors.text,
    borderBottomWidth: 2,
    borderBottomColor: inputScreenColors.line,
    paddingVertical: 12,
    width: '100%',
  },
  goButton: {
    marginTop: 28,
    width: '100%',
    borderWidth: 3,
    borderColor: inputScreenColors.buttonBorder,
    paddingVertical: 16,
    alignItems: 'center',
  },
  goButtonText: {
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    color: inputScreenColors.buttonText,
    letterSpacing: 4,
  },
  browseButton: {
    marginTop: 12,
    width: '100%',
    borderWidth: 3,
    borderColor: inputScreenColors.buttonBorder,
    paddingVertical: 16,
    alignItems: 'center',
  },
  browseButtonText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: inputScreenColors.secondaryText,
    letterSpacing: 3,
  },
  scrollHint: {
    position: 'absolute',
    bottom: 40,
  },
  scrollHintText: {
    fontFamily: theme.fonts.mono,
    fontSize: 24,
    color: inputScreenColors.secondaryText,
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
    color: inputScreenColors.secondaryText,
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
    color: inputScreenColors.secondaryText,
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
    color: inputScreenColors.secondaryText,
    marginTop: 4,
  },
  recentArrow: {
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    color: inputScreenColors.buttonText,
    marginLeft: 12,
  },
  separator: {
    fontFamily: theme.fonts.mono,
    color: inputScreenColors.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 2,
    opacity: 0.4,
  },
});
