export const TRIGGERS = [
  'Stress',
  'Boredom',
  'Loneliness',
  'Tired',
  'Social',
  'Late night',
  'Other',
] as const;

export type Trigger = (typeof TRIGGERS)[number];