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
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4f46e5",
      }}
    >
      <Text style={{ fontSize: 96, fontWeight: "bold", color: "white" }}>
        {days}
      </Text>
      <Text style={{ fontSize: 20, color: "#c7d2fe", marginBottom: 24 }}>
        {days === 1 ? "day" : "days"}
      </Text>
      <Text style={{ fontSize: 36, fontWeight: "600", color: "white" }}>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </Text>
    </View>
  );
}