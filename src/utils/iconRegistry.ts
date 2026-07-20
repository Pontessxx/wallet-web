import type { ComponentType } from 'react';
import * as LucideIcons from 'lucide-react';

export type IconComponent = ComponentType<{ size?: number; color?: string }>;

const PASCAL_NAME_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

export const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

export const toPascalCase = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

export const toIconLabel = (pascalName: string) =>
  pascalName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

const iconRegistry = (LucideIcons as { icons?: Record<string, IconComponent> }).icons ?? {};

const iconPascalNames = Object.keys(iconRegistry).filter(
  (name) => PASCAL_NAME_REGEX.test(name) && !name.endsWith('Icon')
);

export const ICONS_BY_KEY: Record<string, IconComponent> = iconPascalNames.reduce<Record<string, IconComponent>>(
  (acc, pascalName) => {
    const icon = iconRegistry[pascalName];
    if (!icon) return acc;

    acc[toKebabCase(pascalName)] = icon;
    return acc;
  },
  {}
);

export const ALL_ICON_OPTIONS: Array<{ value: string; label: string }> = iconPascalNames
  .map((pascalName) => ({
    value: toKebabCase(pascalName),
    label: toIconLabel(pascalName),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const resolveIcon = (iconKey: string | undefined, defaultKey: string): IconComponent => {
  if (!iconKey) return ICONS_BY_KEY[defaultKey];

  const normalizedKey = toKebabCase(iconKey);
  if (ICONS_BY_KEY[normalizedKey]) return ICONS_BY_KEY[normalizedKey];

  const pascalFromKey = toPascalCase(iconKey);
  const fallbackKey = toKebabCase(pascalFromKey);
  return ICONS_BY_KEY[fallbackKey] ?? ICONS_BY_KEY[defaultKey];
};
