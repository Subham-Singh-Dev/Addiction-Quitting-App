// Chip list for the journal's "skills I gained" tags.
// Same pattern as triggers.ts: a plain constant, no React.

export const SKILLS = [
  'Discipline',
  'Focus',
  'Patience',
  'Self-control',
  'Consistency',
  'Fitness',
  'Emotional awareness',
  'Time management',
  'Confidence',
  'Calm',
] as const;

export type Skill = (typeof SKILLS)[number];