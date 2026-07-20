import { ALL_ICON_OPTIONS, resolveIcon } from '@/utils/iconRegistry';

export const DEFAULT_GOAL_ICON = 'target';

// Mantida em sincronia com o allowlist de AuthApi/Controllers/V2/Goal.cs
const GOAL_ICON_KEYS = [
  'target',
  'plane',
  'graduation-cap',
  'footprints',
  'watch',
  'home',
  'car',
  'gift',
  'piggy-bank',
  'heart',
  'laptop',
  'smartphone',
  'camera',
  'book-open',
  'briefcase',
  'dumbbell',
  'gamepad-2',
  'umbrella',
  'star',
  'wallet',
];

export const GOAL_ICON_OPTIONS: Array<{ value: string; label: string }> = ALL_ICON_OPTIONS.filter((option) =>
  GOAL_ICON_KEYS.includes(option.value)
);

export const getGoalIcon = (iconKey?: string) => resolveIcon(iconKey, DEFAULT_GOAL_ICON);
