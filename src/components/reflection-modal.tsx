import { TRIGGERS } from '@/constants/triggers';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';

type Props = {
  visible: boolean;
  saving?: boolean;
  onSave: (data: { reflection: string | null; trigger: string | null }) => void;
  onSkip: () => void;
};

export function ReflectionModal({ visible, saving = false, onSave, onSkip }: Props) {
  const [reflection, setReflection] = useState('');
  const [trigger, setTrigger] = useState<string | null>(null);

  const reset = () => {
    setReflection('');
    setTrigger(null);
  };

  const handleSave = () => {
    onSave({ reflection: reflection.trim() || null, trigger });
    reset();
  };

  const handleSkip = () => {
    onSkip();
    reset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {}} // back button does nothing: choose Save or Skip
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="rounded-t-3xl bg-neutral-900 p-6 pb-10">
          <Text className="text-xl font-semibold text-white">
            It happens. Want to reflect?
          </Text>
          <Text className="mt-1 text-sm text-neutral-400">
            Your best streak is safe. This stays on your device.
          </Text>

          <Text className="mt-5 mb-2 text-sm text-neutral-300">What triggered it?</Text>
          <View className="flex-row flex-wrap gap-2">
            {TRIGGERS.map((t) => {
              const selected = trigger === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTrigger(selected ? null : t)}
                  className={`rounded-full border px-4 py-2 ${
                    selected ? 'border-white bg-white' : 'border-neutral-600'
                  }`}
                >
                  <Text className={selected ? 'text-black' : 'text-neutral-200'}>{t}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-5 mb-2 text-sm text-neutral-300">
            What would you do differently? (optional)
          </Text>
          <TextInput
            value={reflection}
            onChangeText={setReflection}
            placeholder="A sentence or two is enough"
            placeholderTextColor="#737373"
            multiline
            maxLength={500}
            textAlignVertical="top"
            className="min-h-[96px] rounded-xl bg-neutral-800 p-3 text-white"
          />

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={handleSkip}
              disabled={saving}
              className="flex-1 items-center rounded-xl border border-neutral-600 py-3"
            >
              <Text className="text-neutral-200">Skip</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className="flex-1 items-center rounded-xl bg-white py-3"
            >
              <Text className="font-semibold text-black">{saving ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}