import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listEntries, type JournalEntry } from '@/db/journal';
import { formatEntryDate } from '@/features/journal/formatEntryDate';

export default function JournalScreen() {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);

  // Reloads every time this screen comes into focus (e.g. after saving an entry).
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function load() {
        try {
          const rows = await listEntries(db);
          if (isMounted) setEntries(rows);
        } catch (e) {
          if (isMounted) setEntries([]);
          Alert.alert('Could not load journal', String(e));
        }
      }

      load();

      return () => {
        isMounted = false;
      };
    }, [db]),
  );

  const handleNewEntry = () => {
    // Step 4 replaces this with the entry form.
    Alert.alert('Coming next', 'The entry form is built in step 4.');
  };

  if (entries === null) return <View className="flex-1 bg-black" />;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <Text className="text-2xl font-bold text-white">Journal</Text>
        <Pressable
          onPress={handleNewEntry}
          accessibilityRole="button"
          className="rounded-xl bg-white px-4 py-2"
        >
          <Text className="font-semibold text-black">New entry</Text>
        </Pressable>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="flex-grow px-6 pb-10 pt-4 gap-3"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24">
            <Text className="text-lg font-semibold text-white">No entries yet</Text>
            <Text className="mt-2 text-center text-neutral-400">
              Write what you learned today. It stays on your device.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="rounded-2xl bg-neutral-900 p-5">
            <Text className="text-xs text-neutral-500">{formatEntryDate(item.date)}</Text>
            <Text className="mt-2 text-white" numberOfLines={4}>
              {item.text}
            </Text>
            {item.skillTags.length > 0 && (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {item.skillTags.map((tag) => (
                  <View key={tag} className="rounded-full bg-neutral-800 px-3 py-1">
                    <Text className="text-xs text-neutral-300">{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}