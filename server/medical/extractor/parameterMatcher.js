import { aliasResolver } from '../resolver/aliasResolver.js';

/**
 * Resolves the longest label-shaped prefix of an OCR line. Every candidate is
 * passed through the existing catalog-backed resolver; no parameter IDs or
 * aliases are embedded here.
 */
export function matchParameter(line, { resolve = aliasResolver } = {}) {
  if (typeof line !== 'string' || !line.trim()) return null;
  const source = line.trim().replace(/^[|:;,.\-\s]+/u, '');
  const offset = line.indexOf(source);
  const ends = new Set([source.length]);
  for (const match of source.matchAll(/[\s:;|,\[\]()]+/gu)) ends.add(match.index);

  const candidates = [...ends].sort((a, b) => b - a).map((end) => ({
    end,
    label: source.slice(0, end).trim().replace(/[|:;,\-\s]+$/u, ''),
  })).filter(({ label }) => label);

  // First retain the resolver's O(1) exact/normalized lookup behavior. A 1.0
  // fuzzy threshold means fuzzy fallback cannot turn trailing values into a
  // parameter label.
  for (const { end, label } of candidates) {
    const parameter = resolve(label, { fuzzyThreshold: 1 });
    if (parameter) return { parameter, label, start: offset, end: offset + end };
  }

  // OCR typo tolerance applies only to label-shaped candidates. Numeric labels
  // such as B12 are already handled by the exact pass above.
  for (const { end, label } of candidates) {
    if (/\d/u.test(label)) continue;
    const parameter = resolve(label);
    if (parameter) return { parameter, label, start: offset, end: offset + end };
  }
  return null;
}

export default matchParameter;
