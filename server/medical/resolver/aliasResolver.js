import { aliasMap, buildAliasMap } from './aliasMap.js';
import { findFuzzyMatch } from './fuzzyMatcher.js';
import { normalizeAlias, toAliasKey } from './tokenizer.js';

/** Default minimum Jaro-Winkler score for OCR-tolerant matching. */
export const DEFAULT_FUZZY_THRESHOLD = 0.9;

/**
 * Creates an independent resolver backed by pre-built alias indexes.
 *
 * @param {{ exact: Map<string, object>, normalized: Map<string, object>, caseInsensitive: Map<string, object>, fuzzy: Map<string, object>, trigramIndex: Map<string, Set<string>> }} indexes Alias indexes.
 * @returns {(value: unknown, options?: { fuzzyThreshold?: number }) => object | null} Alias resolver.
 */
export function createAliasResolver(indexes = aliasMap) {
  return function resolveAlias(value, { fuzzyThreshold = DEFAULT_FUZZY_THRESHOLD } = {}) {
    if (typeof value !== 'string' || !value.trim()) return null;
    if (!Number.isFinite(fuzzyThreshold) || fuzzyThreshold < 0 || fuzzyThreshold > 1) {
      throw new RangeError('fuzzyThreshold must be a number between 0 and 1.');
    }

    // Priority 1: raw exact alias.
    const exact = indexes.exact.get(value);
    if (exact) return exact;

    // Priority 2: punctuation, Unicode, and whitespace-normalized alias.
    const normalized = indexes.normalized.get(normalizeAlias(value));
    if (normalized) return normalized;

    // Priority 3: normalized case-insensitive alias.
    const caseInsensitive = indexes.caseInsensitive.get(toAliasKey(value));
    if (caseInsensitive) return caseInsensitive;

    // Priority 4: indexed fuzzy lookup for OCR character substitutions.
    const fuzzy = findFuzzyMatch(toAliasKey(value), indexes.trigramIndex, fuzzyThreshold);
    return fuzzy ? indexes.fuzzy.get(fuzzy.key) ?? null : null;
  };
}

/** Resolves a report label to its canonical parameter, or null when unknown. */
export const aliasResolver = createAliasResolver();

export { buildAliasMap };
export default aliasResolver;
