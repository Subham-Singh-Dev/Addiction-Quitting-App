import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { Checkin } from '@/db/checkins';
import { MOODS, isValidMood, type Mood } from '@/features/journal/checkin';

const MOOD_INFO: Record<Mood, { emoji: string; label: string }> = {
  1: { emoji: '😞', label: 'Rough' },
  2: { emoji: '😕', label: 'Low' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '🙂', label: 'Good' },
  5: { emoji: '😄', label: 'Great' },
};

type Props = {
  /** Today's saved check-in, or null if none yet. */
  checkin: Checkin | null;
  /** Resolve to true if saved, false if it failed (the parent shows the error). */
  onSave: (mood: Mood, note: string | null) => Promise<boolean>;
};

export function CheckinCard({ checkin, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    if (checkin && isValidMood(checkin.mood)) setMood(checkin.mood);
    setNote(checkin?.note ?? '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (mood === null || saving) return;
    setSaving(true);
    const ok = await onSave(mood, note.trim() || null);
    setSaving(false);
    if (ok) setEditing(false);
  };

  // State 1: already checked in and not editing -> summary
  if (checkin && !editing) {
    const info = isValidMood(checkin.mood) ? MOOD_INFO[checkin.mood] : null;
    return (
      <View className="mt-8 w-full rounded-2xl bg-neutral-900 p-5">
        <Text className="text-base font-semibold text-emerald-400">Checked in today ✓</Text>
        {info && (
          <Text className="mt-2 text-lg text-white">
            {info.emoji} {info.label}
          </Text>
        )}
        {checkin.note ? (
          <Text className="mt-2 text-neutral-300">{checkin.note}</Text>
        ) : null}
        <Pressable
          onPress={startEditing}
          accessibilityRole="button"
          className="mt-4 self-start rounded-lg border border-neutral-600 px-4 py-2"
        >
          <Text className="text-neutral-200">Edit</Text>
        </Pressable>
      </View>
    );
  }

  // State 2: no check-in yet, or editing -> form
  return (
    <View className="mt-8 w-full rounded-2xl bg-neutral-900 p-5">
      <Text className="text-base font-semibold text-white">
        {checkin ? 'Update today’s check-in' : 'How are you today?'}
      </Text>

      <View className="mt-4 flex-row gap-2">
        {MOODS.map((m) => {
          const selected = mood === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMood(m)}
              accessibilityRole="button"
              accessibilityLabel={`Mood ${m}: ${MOOD_INFO[m].label}`}
              accessibilityState={{ selected }}
              className={`flex-1 items-center rounded-xl border py-3 ${
                selected ? 'border-white bg-white' : 'border-neutral-700'
              }`}
            >
              <Text className="text-2xl">{MOOD_INFO[m].emoji}</Text>
              <Text className={`mt-1 text-xs ${selected ? 'text-black' : 'text-neutral-400'}`}>
                {MOOD_INFO[m].label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Add a note (optional)"
        placeholderTextColor="#737373"
        multiline
        maxLength={500}
        textAlignVertical="top"
        className="mt-4 min-h-[72px] rounded-xl bg-neutral-800 p-3 text-white"
      />
      <Text className="mt-2 text-xs text-neutral-500">Stays on your device.</Text>

      <View className="mt-4 flex-row gap-3">
        {checkin && (
          <Pressable
            onPress={() => setEditing(false)}
            disabled={saving}
            accessibilityRole="button"
            className="flex-1 items-center rounded-xl border border-neutral-600 py-3"
          >
            <Text className="text-neutral-200">Cancel</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleSave}
          disabled={mood === null || saving}
          accessibilityRole="button"
          className={`flex-1 items-center rounded-xl bg-white py-3 ${
            mood === null || saving ? 'opacity-40' : ''
          }`}
        >
          <Text className="font-semibold text-black">{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </View>
    </View>
  );
}