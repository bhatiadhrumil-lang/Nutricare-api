/**
 * Returns a display-preserving normalized token suitable for alias lookup.
 * It removes invisible Unicode artifacts, standardizes OCR punctuation, and
 * collapses all whitespace without applying medical-domain substitutions.
 *
 * @param {unknown} value Text supplied by a laboratory report or OCR engine.
 * @returns {string} Normalized text, or an empty string for non-text input.
 */
export function normalizeAlias(value) {
  if (typeof value !== 'string') return '';

  return value
    .normalize('NFKC')
    .replace(/[\u00A0\u2000-\u200B\u202F\u2060\uFEFF]/g, ' ')
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[|¦]/g, ' ')
    .replace(/[\t\r\n\f\v]+/g, ' ')
    .replace(/[,:;_\\/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns a normalized, case-insensitive lookup key.
 *
 * @param {unknown} value Text supplied by a laboratory report or OCR engine.
 * @returns {string} Case-insensitive normalized key.
 */
export function toAliasKey(value) {
  return normalizeAlias(value).toLocaleLowerCase();
}

/**
 * Splits a normalized alias into non-empty tokens.
 *
 * @param {unknown} value Text supplied by a laboratory report or OCR engine.
 * @returns {string[]} Normalized lowercase tokens.
 */
export function tokenize(value) {
  const key = toAliasKey(value);
  return key ? key.split(/[\s-]+/).filter(Boolean) : [];
}
