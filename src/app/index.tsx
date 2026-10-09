import { ReflectionModal } from '@/components/reflection-modal';
import {
  getOrCreateDefaultTracker,
  resetTracker,
  type Tracker,
} from '@/db/trackers';
import { getStreakBreakdown } from '@/features/streak/calculateStreak';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [reflecting, setReflecting] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const defaultTracker = await getOrCreateDefaultTracker(db);
    setTracker(defaultTracker);
  }, [db]);

  // FIX: Wrapped the async call explicitly to decouple direct execution from the effect body
  useEffect(() => {
    let isMounted = true;

    async function initializeTracker() {
      if (isMounted) {
        await load();
      }
    }

    initializeTracker();

    return () => {
      isMounted = false;
    };
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const confirmSlip = () => {
    Alert.alert('Reset streak?', 'Your best streak is kept.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'I slipped', style: 'destructive', onPress: () => setReflecting(true) },
    ]);
  };

  const finishReset = async (data: { reflection: string | null; trigger: string | null }) => {
    if (!tracker || saving) return;
    setSaving(true);
    try {
      await resetTracker(db, tracker.id, data);
      await load();
      setNow(new Date());
      setReflecting(false);
    } catch (e) {
      Alert.alert('Could not reset', String(e));
    } finally {
      setSaving(false);
    }
  };

  if (!tracker) return <View className="flex-1 bg-black" />;

  // ADAPT: match your getStreakBreakdown signature + return shape
  const b = getStreakBreakdown(tracker.streak_start_date, now);

  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      {/* ADAPT: keep your existing counter JSX if it differs */}
      <Text className="text-6xl font-bold text-white">{b.days}</Text>
      <Text className="text-neutral-400">days</Text>
      <Text className="mt-2 text-neutral-300">
        {b.hours}h {b.minutes}m {b.seconds}s
      </Text>
      <Text className="mt-6 text-neutral-400">Best: {tracker.best_streak_days} days</Text>

      <Pressable onPress={confirmSlip} className="mt-10 rounded-xl border border-red-500 px-6 py-3">
        <Text className="text-red-400">I slipped</Text>
      </Pressable>

      <ReflectionModal
        visible={reflecting}
        saving={saving}
        onSave={finishReset}
        onSkip={() => finishReset({ reflection: null, trigger: null })}
      />
    </View>
  );
}
