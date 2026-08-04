import { QUALITATIVE_VALUES, RISK_VALUES } from './referencePatterns.js';

function compact(value) {
  return value.trim().toLocaleLowerCase().replace(/[\s-]+/gu, ' ');
}

export function parseQualitativeReference(raw) {
  if (typeof raw !== 'string') return null;
  const value = compact(raw);
  for (const [phrase, normalized] of RISK_VALUES) {
    if (value === phrase) return { type: 'risk-category', value: normalized };
  }
  for (const [phrase, normalized] of QUALITATIVE_VALUES) {
    if (value === phrase) return { type: 'qualitative', value: normalized };
  }
  return null;
}

export default parseQualitativeReference;
