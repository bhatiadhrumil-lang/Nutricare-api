import { calculateConfidence } from './confidence.js';
import { matchParameter } from './parameterMatcher.js';
import { parseUnit } from './unitParser.js';
import { parseValue } from './valueParser.js';

function extractReferenceRange(tail) {
  return tail
    .replace(/^\s*(?:\||,|;|:|-)?\s*/u, '')
    .replace(/^(?:reference\s*(?:range|interval)?|ref\.?\s*range|normal\s*range)\s*[:=]?\s*/iu, '')
    .trim() || null;
}

/**
 * Fallback parser for compact OCR lines where the separator between the
 * label and the value (and between repeated values) was lost during PDF text
 * extraction — e.g. multi-column longitudinal reports that render as
 * "Haemoglobin11.811.612.011.711.6g/dl12.0 - 15.0". This is intentionally
 * conservative: the first well-formed value before the unit anchor is taken,
 * and anything ambiguous returns null so the line stays unmatched instead of
 * producing a wrong reading.
 */
function parseCompactLine(afterLabel, parameter) {
  if (typeof afterLabel !== 'string') return null;

  const units = [...(parameter?.units ?? [])].sort((a, b) => b.length - a.length);
  if (!units.length) return null;

  const scanText = afterLabel.replace(/~/gu, '^').toLocaleLowerCase();
  let anchor = null;
  for (const unit of units) {
    const index = scanText.indexOf(unit.toLocaleLowerCase());
    if (index >= 0 && (anchor === null || index < anchor.index)) {
      anchor = { index, unit };
    }
  }
  if (!anchor) return null;

  const prefix = afterLabel.slice(0, anchor.index);
  // First run of digits in the prefix — with concatenated columns the first
  // well-formed number is the first column's value, and anything after it is
  // the remaining columns' readings. A single-dot greedy scan can over-consume
  // one digit from the next column (14.319 vs 14.3), but that stays within the
  // same clinical band; column-spanning inference is deliberately NOT attempted
  // because it produced false emergency alerts (e.g. 319.03 for lymphocytes).
  const valueMatch = /(\d+(?:\.\d+)?)/u.exec(prefix);
  if (!valueMatch) return null;

  const number = Number(valueMatch[1]);
  if (!Number.isFinite(number)) return null;

  const unitEnd = anchor.index + anchor.unit.length;
  const referenceRange = extractReferenceRange(afterLabel.slice(unitEnd));

  return {
    value: { raw: valueMatch[1], number, comparator: null },
    unit: {
      raw: afterLabel.slice(anchor.index, unitEnd),
      unit: anchor.unit,
      start: anchor.index,
      end: unitEnd,
      catalogMatch: true,
    },
    referenceRange,
  };
}

/**
 * True when a number parsed by the strict path is not plausibly the first
 * token after the label: it sits behind other words ("Calculated 36.7") or
 * its raw text is immediately followed by more digits ("35.2%36-46").
 */
function isSuspiciousStrictValue(afterLabel, value) {
  const leading = afterLabel.slice(0, value.start);
  if (/[\p{L}]/u.test(leading)) return true;
  const following = afterLabel.slice(value.end);
  if (/^\d/u.test(following)) return true;
  return false;
}

/** Parses exactly one OCR line into a parameter record or an unmatched record. */
export function parseLine(line, lineNumber, options = {}) {
  const parameterMatch = matchParameter(line, options);
  if (!parameterMatch) return { unmatched: { line, lineNumber, reason: 'parameter_not_found' } };

  const afterLabel = line.slice(parameterMatch.end);
  const value = parseValue(afterLabel);
  const suspicious = value ? isSuspiciousStrictValue(afterLabel, value) : false;

  let parameter;
  if (value && !suspicious) {
    const afterValue = afterLabel.slice(value.end);
    const unit = parseUnit(afterValue, parameterMatch.parameter);
    const referenceStart = unit ? unit.end : 0;
    const referenceRange = extractReferenceRange(afterValue.slice(referenceStart));

    parameter = {
      parameterId: parameterMatch.parameter.id,
      displayName: parameterMatch.parameter.displayName,
      value: value.number,
      valueRaw: value.raw,
      comparator: value.comparator,
      unit: unit?.unit ?? null,
      unitRaw: unit?.raw ?? null,
      referenceRange,
      confidence: calculateConfidence({ parameter: parameterMatch.parameter, value, unit }),
      source: { line, lineNumber, label: parameterMatch.label },
    };
  } else {
    // Strict parse failed or is unreliable (run-together / junk before the
    // value): try the compact fallback for concatenated OCR lines.
    const compact = parseCompactLine(afterLabel, parameterMatch.parameter);
    if (!compact) {
      return { unmatched: { line, lineNumber, reason: 'value_not_found', parameterId: parameterMatch.parameter.id } };
    }

    parameter = {
      parameterId: parameterMatch.parameter.id,
      displayName: parameterMatch.parameter.displayName,
      value: compact.value.number,
      valueRaw: compact.value.raw,
      comparator: compact.value.comparator,
      unit: compact.unit.unit,
      unitRaw: compact.unit.raw,
      referenceRange: compact.referenceRange,
      confidence: calculateConfidence({ parameter: parameterMatch.parameter, value: compact.value, unit: compact.unit }),
      source: { line, lineNumber, label: parameterMatch.label },
    };
  }

  return { parameter };
}

export default parseLine;