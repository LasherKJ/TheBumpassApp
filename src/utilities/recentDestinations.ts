import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Destination } from '../types';

const STORAGE_KEY = 'recent_destinations';
const MAX_RECENT = 5;

export async function getRecentDestinations(): Promise<Destination[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  return JSON.parse(json) as Destination[];
}

export async function addRecentDestination(destination: Destination): Promise<Destination[]> {
  const recents = await getRecentDestinations();
  const filtered = recents.filter((d) => d.id !== destination.id);
  const updated = [destination, ...filtered].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
