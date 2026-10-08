import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { getStreakBreakdown } from "@/features/streak/calculateStreak";

const STREAK_START = "2026-10-05T08:00:00.000Z";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Index() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = getStreakBreakdown(STREAK_START, now);

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