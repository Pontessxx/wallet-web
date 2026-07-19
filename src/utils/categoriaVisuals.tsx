import type { CategoriaIconKey } from '@/types/categoria';
import { ALL_ICON_OPTIONS, resolveIcon } from '@/utils/iconRegistry';

export const DEFAULT_CATEGORIA_ICON: CategoriaIconKey = 'tag';
export const DEFAULT_CATEGORIA_COLOR = '#64748B';

export const CATEGORIA_ICON_OPTIONS: Array<{ value: CategoriaIconKey; label: string }> = ALL_ICON_OPTIONS;

export const CATEGORIA_COLOR_OPTIONS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
];

export const getCategoriaIcon = (iconKey?: string) => resolveIcon(iconKey, DEFAULT_CATEGORIA_ICON);

export const normalizeCategoriaColor = (colorHex?: string) => {
  if (!colorHex) return DEFAULT_CATEGORIA_COLOR;
  return colorHex;
};
