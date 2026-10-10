import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

import { SKILLS } from '@/constants/skills';
import type { JournalEntry } from '@/db/journal';

type Props = {
  /** The entry being edited, or null when writing a new one. */
  entry: JournalEntry | null;
  saving?: boolean;
  onSave: (data: { text: string; skillTags: string[] }) => void;
  /** Only passed when editing. */
  onDelete?: () => void;
  onClose: () => void;
};

export function JournalEntryModal({ entry, saving = false, onSave, onDelete, onClose }: Props) {
  // The parent mounts this fresh each time it opens, so initial state is enough.
  const [text, setText] = useState(entry?.text ?? '');
  const [tags, setTags] = useState<string[]>(entry?.skillTags ?? []);

  // Show the standard chips, plus any older tags this entry already has.
  const knownSkills: readonly string[] = SKILLS;
  const extraTags = (entry?.skillTags ?? []).filter((t) => !knownSkills.includes(t));
  const options = [...SKILLS, ...extraTags];

  const canSave = text.trim().length > 0 && !saving;

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({ text: text.trim(), skillTags: tags });
  };

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="max-h-[90%] rounded-t-3xl bg-neutral-900">
          <ScrollView
            contentContainerClassName="p-6 pb-10"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-xl font-semibold text-white">
              {entry ? 'Edit entry' : 'New entry'}
            </Text>
            <Text className="mt-1 text-sm text-neutral-400">
              What did you do or learn today? This stays on your device.
            </Text>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write freely…"
              placeholderTextColor="#737373"
              multiline
              maxLength={2000}
              textAlignVertical="top"
              className="mt-4 min-h-[140px] rounded-xl bg-neutral-800 p-3 text-white"
            />

            <Text className="mb-2 mt-5 text-sm text-neutral-300">
              Skills I gained (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {options.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-full border px-4 py-2 ${
                      selected ? 'border-white bg-white' : 'border-neutral-600'
                    }`}
                  >
                    <Text className={selected ? 'text-black' : 'text-neutral-200'}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={saving}
                accessibilityRole="button"
                className="flex-1 items-center rounded-xl border border-neutral-600 py-3"
              >
                <Text className="text-neutral-200">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={!canSave}
                accessibilityRole="button"
                className={`flex-1 items-center rounded-xl bg-white py-3 ${
                  canSave ? '' : 'opacity-40'
                }`}
              >
                <Text className="font-semibold text-black">{saving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>

            {onDelete && (
              <Pressable
                onPress={onDelete}
                disabled={saving}
                accessibilityRole="button"
                className="mt-4 items-center py-2"
              >
                <Text className="text-red-400">Delete entry</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}