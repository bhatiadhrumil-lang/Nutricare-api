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

/** Parses exactly one OCR line into a parameter record or an unmatched record. */
export function parseLine(line, lineNumber, options = {}) {
  const parameterMatch = matchParameter(line, options);
  if (!parameterMatch) return { unmatched: { line, lineNumber, reason: 'parameter_not_found' } };

  const afterLabel = line.slice(parameterMatch.end);
  const value = parseValue(afterLabel);
  if (!value) return { unmatched: { line, lineNumber, reason: 'value_not_found', parameterId: parameterMatch.parameter.id } };

  const afterValue = afterLabel.slice(value.end);
  const unit = parseUnit(afterValue, parameterMatch.parameter);
  const referenceStart = unit ? unit.end : 0;
  const referenceRange = extractReferenceRange(afterValue.slice(referenceStart));

  return {
    parameter: {
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
    },
  };
}

export default parseLine;
