import type { ComponentType } from 'react';
import * as LucideIcons from 'lucide-react';
import type { CategoriaIconKey } from '@/types/categoria';

export const DEFAULT_CATEGORIA_ICON: CategoriaIconKey = 'tag';
export const DEFAULT_CATEGORIA_COLOR = '#64748B';

type IconComponent = ComponentType<{ size?: number; color?: string }>;

const PASCAL_NAME_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const toPascalCase = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const toLabel = (pascalName: string) =>
  pascalName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

const iconRegistry = (LucideIcons as { icons?: Record<string, IconComponent> }).icons ?? {};

const iconPascalNames = Object.keys(iconRegistry).filter(
  (name) => PASCAL_NAME_REGEX.test(name) && !name.endsWith('Icon')
);

const ICONS_BY_KEY: Record<string, IconComponent> = iconPascalNames.reduce<Record<string, IconComponent>>(
  (acc, pascalName) => {
    const icon = iconRegistry[pascalName];
    if (!icon) return acc;

    acc[toKebabCase(pascalName)] = icon;
    return acc;
  },
  {}
);

export const CATEGORIA_ICON_OPTIONS: Array<{ value: CategoriaIconKey; label: string }> = iconPascalNames
  .map((pascalName) => ({
    value: toKebabCase(pascalName),
    label: toLabel(pascalName),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

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

export const getCategoriaIcon = (iconKey?: string) => {
  if (!iconKey) return ICONS_BY_KEY[DEFAULT_CATEGORIA_ICON];

  const normalizedKey = toKebabCase(iconKey);
  if (ICONS_BY_KEY[normalizedKey]) return ICONS_BY_KEY[normalizedKey];

  const pascalFromKey = toPascalCase(iconKey);
  const fallbackKey = toKebabCase(pascalFromKey);
  return ICONS_BY_KEY[fallbackKey] ?? ICONS_BY_KEY[DEFAULT_CATEGORIA_ICON];
};

export const normalizeCategoriaColor = (colorHex?: string) => {
  if (!colorHex) return DEFAULT_CATEGORIA_COLOR;
  return colorHex;
};
