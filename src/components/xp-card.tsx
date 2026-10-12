import { Text, View } from 'react-native';

import { getLevelInfo } from '@/features/xp/xp';

type Props = {
  totalXp: number;
};

export function XpCard({ totalXp }: Props) {
  const info = getLevelInfo(totalXp);

  return (
    <View className="mt-8 w-full rounded-2xl bg-neutral-900 p-5">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-base font-semibold text-white">Level {info.level}</Text>
        <Text className="text-sm text-neutral-400">{totalXp} XP</Text>
      </View>

      <View className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
        <View
          className="h-2 rounded-full bg-emerald-400"
          style={{ width: `${Math.round(info.progress * 100)}%` }}
        />
      </View>

      <Text className="mt-2 text-xs text-neutral-500">
        {info.xpIntoLevel} / {info.xpForNextLevel} XP to level {info.level + 1}
      </Text>
    </View>
  );
}