import parameterCatalog from '../parameterCatalog.js';
import { normalizeAlias, toAliasKey } from './tokenizer.js';
import { trigrams } from './fuzzyMatcher.js';

/**
 * Builds immutable lookup structures directly from a parameter catalog.
 * Display names are indexed alongside aliases so canonical labels resolve too.
 *
 * @param {readonly object[]} catalog Laboratory parameter catalog.
 * @returns {{ exact: Map<string, object>, normalized: Map<string, object>, caseInsensitive: Map<string, object>, fuzzy: Map<string, object>, trigramIndex: Map<string, Set<string>> }} Indexed aliases.
 */
export function buildAliasMap(catalog = parameterCatalog) {
  const exact = new Map();
  const normalized = new Map();
  const caseInsensitive = new Map();
  const fuzzy = new Map();
  const trigramIndex = new Map();

  const register = (map, key, parameter, label) => {
    if (!key) return;
    const existing = map.get(key);
    if (existing && existing.id !== parameter.id) {
      throw new Error(`Ambiguous medical alias "${label}" for ${existing.id} and ${parameter.id}.`);
    }
    map.set(key, parameter);
  };

  for (const parameter of catalog) {
    for (const alias of [parameter.displayName, ...parameter.aliases]) {
      const normalizedAlias = normalizeAlias(alias);
      const key = toAliasKey(alias);
      register(exact, alias, parameter, alias);
      register(normalized, normalizedAlias, parameter, alias);
      register(caseInsensitive, key, parameter, alias);
      register(fuzzy, key, parameter, alias);
    }
  }

  for (const key of fuzzy.keys()) {
    for (const gram of trigrams(key)) {
      if (!trigramIndex.has(gram)) trigramIndex.set(gram, new Set());
      trigramIndex.get(gram).add(key);
    }
  }

  return { exact, normalized, caseInsensitive, fuzzy, trigramIndex };
}

/** Shared lookup index built once from the centralized parameter catalog. */
export const aliasMap = buildAliasMap();

export default aliasMap;
