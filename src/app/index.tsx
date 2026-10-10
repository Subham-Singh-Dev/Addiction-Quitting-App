import { CheckinCard } from '@/components/checkin-card';
import { ReflectionModal } from '@/components/reflection-modal';
import { getTodayCheckin, saveCheckin, type Checkin } from '@/db/checkins';
import {
  getOrCreateDefaultTracker,
  resetTracker,
  type Tracker,
} from '@/db/trackers';
import { toLocalDateKey, type Mood } from '@/features/journal/checkin';
import { getStreakBreakdown } from '@/features/streak/calculateStreak';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [reflecting, setReflecting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Changes only when the local calendar day changes (e.g. app left open past midnight).
  const todayKey = toLocalDateKey(now);
  const trackerId = tracker?.id;

  const load = useCallback(async () => {
    const defaultTracker = await getOrCreateDefaultTracker(db);
    setTracker(defaultTracker);
  }, [db]);

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

  // Load today's check-in once we know the tracker, and again when the day changes.
  useEffect(() => {
    if (trackerId === undefined) return;
    let isMounted = true;

    async function loadCheckin(id: number) {
      const row = await getTodayCheckin(db, id, new Date());
      if (isMounted) setCheckin(row);
    }

    loadCheckin(trackerId);

    return () => {
      isMounted = false;
    };
  }, [db, trackerId, todayKey]);

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

  const handleSaveCheckin = async (mood: Mood, note: string | null) => {
    if (!tracker) return false;
    try {
      const when = new Date();
      await saveCheckin(db, tracker.id, mood, note, when);
      setCheckin(await getTodayCheckin(db, tracker.id, when));
      return true;
    } catch (e) {
      Alert.alert('Could not save check-in', String(e));
      return false;
    }
  };

  if (!tracker) return <View className="flex-1 bg-black" />;

  const b = getStreakBreakdown(tracker.streak_start_date, now);

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerClassName="flex-grow items-center justify-center px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-6xl font-bold text-white">{b.days}</Text>
      <Text className="text-neutral-400">days</Text>
      <Text className="mt-2 text-neutral-300">
        {b.hours}h {b.minutes}m {b.seconds}s
      </Text>
      <Text className="mt-6 text-neutral-400">Best: {tracker.best_streak_days} days</Text>

      {/* key={todayKey} resets the card's inputs when a new day starts */}
      <CheckinCard key={todayKey} checkin={checkin} onSave={handleSaveCheckin} />

      <Pressable onPress={confirmSlip} className="mt-10 rounded-xl border border-red-500 px-6 py-3">
        <Text className="text-red-400">I slipped</Text>
      </Pressable>

      <ReflectionModal
        visible={reflecting}
        saving={saving}
        onSave={finishReset}
        onSkip={() => finishReset({ reflection: null, trigger: null })}
      />
    </ScrollView>
  );
}