import { normalizeUnit } from '../normalization/unitAliasEngine.js';
import { parseDemographicReference, containsDemographicLabel } from './demographicReferenceParser.js';
import { parseQualitativeReference } from './qualitativeParser.js';
import { LIMIT_PATTERN, RANGE_PATTERN } from './referencePatterns.js';
import { REFERENCE_WARNING_CODES, validateReference, warning } from './referenceValidator.js';

function number(value) {
  return Number.parseFloat(value.replace(',', '.'));
}

function base(raw, type, extra = {}) {
  return { type, low: null, high: null, unit: null, inclusiveLow: false, inclusiveHigh: false, raw, warnings: [], ...extra };
}

function normalizeEmbeddedUnit(unit, result) {
  if (!unit) return result;
  const normalized = normalizeUnit(unit.trim());
  result.unit = normalized.normalizedUnit || unit.trim();
  if (normalized.normalizationType === 'unknown') result.warnings.push(warning(REFERENCE_WARNING_CODES.UNKNOWN_UNIT, `Reference unit "${unit.trim()}" is not recognized.`));
  if (normalized.normalizationType === 'alias' || normalized.normalizationType === 'ocr-correction') {
    result.warnings.push(warning(REFERENCE_WARNING_CODES.UNIT_NORMALIZED, `Reference unit "${unit.trim()}" was normalized to "${result.unit}".`));
  }
  return result;
}

function parseReferenceValue(raw) {
  const range = RANGE_PATTERN.exec(raw);
  if (range?.groups) return normalizeEmbeddedUnit(range.groups.unit, base(raw, 'range', { low: number(range.groups.low), high: number(range.groups.high), inclusiveLow: true, inclusiveHigh: true }));
  const limit = LIMIT_PATTERN.exec(raw);
  if (limit?.groups) {
    const value = number(limit.groups.value);
    const operator = limit.groups.operator;
    const upper = operator === '<' || operator === '<=' || operator === '≤';
    return normalizeEmbeddedUnit(limit.groups.unit, base(raw, upper ? 'upper-limit' : 'lower-limit', upper
      ? { high: value, inclusiveHigh: operator === '<=' || operator === '≤' }
      : { low: value, inclusiveLow: operator === '>=' || operator === '≥' }));
  }
  return parseQualitativeReference(raw);
}

/**
 * Normalizes one extracted reference string. It is intentionally pure and
 * non-throwing, so callers can compose it after unit normalization without
 * changing the completed extraction or formatter stages.
 */
export function normalizeReference(raw) {
  if (raw === null || raw === undefined || (typeof raw === 'string' && !raw.trim())) {
    return base(raw ?? null, 'missing', { warnings: [warning(REFERENCE_WARNING_CODES.MISSING_REFERENCE, 'Reference range is missing.')] });
  }
  if (typeof raw !== 'string') return base(raw, 'invalid', { warnings: [warning(REFERENCE_WARNING_CODES.INVALID_FORMAT, 'Reference range must be a string.')] });

  const demographic = parseDemographicReference(raw);
  const parsed = parseReferenceValue(demographic?.reference ?? raw.trim());
  if (parsed) return validateReference({ ...parsed, raw, ...(demographic ? { demographic: demographic.demographic } : {}) });

  const looksMalformed = /[0-9<>≤≥]/u.test(raw);
  return base(raw, containsDemographicLabel(raw) ? 'demographic' : looksMalformed ? 'invalid' : 'unknown', {
    warnings: [warning(looksMalformed ? REFERENCE_WARNING_CODES.INVALID_FORMAT : REFERENCE_WARNING_CODES.UNKNOWN_REFERENCE, `Reference "${raw}" could not be normalized.`)],
  });
}

export default normalizeReference;
