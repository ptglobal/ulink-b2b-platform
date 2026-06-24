/**
 * Shared helpers to resolve Directus content translations.
 *
 * Each translatable collection stores a `translations` O2M relation
 * with rows like { languages_code: 'en', name: '...', description: '...' }.
 * These helpers look up the matching locale row and fall back to the
 * base (Vietnamese) field value when no translation is found.
 */

export interface TranslationRow {
  languages_code: string;
  [field: string]: unknown;
}

/**
 * Resolve a single translated field from an item's translations array.
 * Falls back to the base field value on the item itself.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTranslatedField(item: any, field: string, locale: string): string {
  if (item?.translations && Array.isArray(item.translations)) {
    const row = (item.translations as TranslationRow[]).find((t) => t.languages_code === locale);
    if (row && row[field] != null && row[field] !== '') {
      return String(row[field]);
    }
  }
  // Fallback to base field
  const base = item?.[field];
  return base != null ? String(base) : '';
}

/**
 * Shorthand: resolve translated `name` field.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTranslatedName(item: any, locale: string): string {
  return getTranslatedField(item, 'name', locale);
}

/**
 * Shorthand: resolve translated `description` field.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTranslatedDescription(item: any, locale: string): string {
  return getTranslatedField(item, 'description', locale);
}
