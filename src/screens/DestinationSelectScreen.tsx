import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { theme } from '../theme';
import type { Destination } from '../types';

interface DestinationSelectScreenProps {
  searchQuery: string;
  results: Destination[];
  onSelect: (destination: Destination) => void;
  onBack: () => void;
}

export function DestinationSelectScreen({
  searchQuery,
  results,
  onSelect,
  onBack,
}: DestinationSelectScreenProps) {
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
        <Text style={styles.receiptDashes}>- - - - - - - - - - - - - - -</Text>

        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>▲ BACK</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>SELECT DESTINATION</Text>
        <Text style={styles.query}>"{searchQuery}"</Text>

        <Text style={styles.receiptDashes}>- - - - - - - - - - - - - - -</Text>

        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>NO RESULTS FOUND</Text>
            <Text style={styles.emptySubtext}>
              TRY A DIFFERENT ADDRESS
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <Text style={styles.separator}>· · · · · · · · · · · · · ·</Text>
            )}
          />
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
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    fontSize: 14,
    letterSpacing: 4,
    marginVertical: 8,
    textAlign: 'center',
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
});
