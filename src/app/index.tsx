import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { getOrCreateDefaultTracker, type Tracker } from "@/db/trackers";
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

  return (
    <View className="flex-1 items-center justify-center bg-indigo-600">
      <Text className="text-8xl font-bold text-white">{days}</Text>
      <Text className="mb-6 text-xl text-indigo-200">
        {days === 1 ? "day" : "days"}
      </Text>
      <Text className="text-4xl font-semibold text-white">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </Text>
    </View>
  );
}