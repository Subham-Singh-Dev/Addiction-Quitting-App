import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import {
  getDefaultTracker,
  getOrCreateDefaultTracker,
  resetTracker,
  type Tracker,
} from "@/db/trackers";
import { getStreakBreakdown } from "@/features/streak/calculateStreak";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Index() {
  const db = useSQLiteContext();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Load the tracker from SQLite once (creates one on first launch)
  useEffect(() => {
    let cancelled = false;
    getOrCreateDefaultTracker(db).then((t) => {
      if (!cancelled) setTracker(t);
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // All hooks are above this line. Early return must stay below them.
  if (!tracker) {
    return (
      <View className="flex-1 items-center justify-center bg-indigo-600">
        <Text className="text-xl text-indigo-200">Loading...</Text>
      </View>
    );
  }

  const { days, hours, minutes, seconds } = getStreakBreakdown(
    tracker.streak_start_date,
    now
  );
  const bestDays = Math.max(tracker.best_streak_days, days);

  const handleReset = () => {
    Alert.alert(
      "Start again?",
      "Your best streak is saved. A slip doesn't erase your progress.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start again",
          style: "destructive",
          onPress: async () => {
            await resetTracker(db, tracker.id, days);
            const updated = await getDefaultTracker(db);
            if (updated) setTracker(updated);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 items-center justify-center bg-indigo-600">
      <Text className="text-8xl font-bold text-white">{days}</Text>
      <Text className="mb-6 text-xl text-indigo-200">
        {days === 1 ? "day" : "days"}
      </Text>
      <Text className="text-4xl font-semibold text-white">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </Text>

      <Text className="mt-8 text-base text-indigo-200">
        Best: {bestDays} {bestDays === 1 ? "day" : "days"}
      </Text>

      <Pressable
        onPress={handleReset}
        className="mt-10 rounded-full bg-white/20 px-8 py-3"
      >
        <Text className="text-base font-medium text-white">I slipped</Text>
      </Pressable>
    </View>
  );
}