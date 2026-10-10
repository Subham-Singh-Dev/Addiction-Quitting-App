import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JournalEntryModal } from '@/components/journal-entry-modal';
import {
  addEntry,
  deleteEntry,
  listEntries,
  updateEntry,
  type JournalEntry,
} from '@/db/journal';
import { toLocalDateKey } from '@/features/journal/checkin';
import { formatEntryDate } from '@/features/journal/formatEntryDate';

// null = form closed. { entry: null } = new entry. { entry } = editing that entry.
type FormState = { entry: JournalEntry | null } | null;

export default function JournalScreen() {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [saving, setSaving] = useState(false);

  // Reloads every time this screen comes into focus.
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

  const handleSave = async (data: { text: string; skillTags: string[] }) => {
    if (saving || !form) return;
    setSaving(true);
    try {
      if (form.entry) {
        await updateEntry(db, form.entry.id, data);
      } else {
        await addEntry(db, { date: toLocalDateKey(new Date()), ...data });
      }
      setEntries(await listEntries(db));
      setForm(null);
    } catch (e) {
      Alert.alert('Could not save entry', String(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    const target = form?.entry;
    if (!target) return;
    Alert.alert('Delete this entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEntry(db, target.id);
            setEntries(await listEntries(db));
            setForm(null);
          } catch (e) {
            Alert.alert('Could not delete entry', String(e));
          }
        },
      },
    ]);
  };

  if (entries === null) return <View className="flex-1 bg-black" />;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <Text className="text-2xl font-bold text-white">Journal</Text>
        <Pressable
          onPress={() => setForm({ entry: null })}
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
          <Pressable
            onPress={() => setForm({ entry: item })}
            accessibilityRole="button"
            className="rounded-2xl bg-neutral-900 p-5"
          >
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
          </Pressable>
        )}
      />

      {/* Mounted only while open, so every open starts with fresh state. */}
      {form && (
        <JournalEntryModal
          entry={form.entry}
          saving={saving}
          onSave={handleSave}
          onDelete={form.entry ? confirmDelete : undefined}
          onClose={() => setForm(null)}
        />
      )}
    </SafeAreaView>
  );
}