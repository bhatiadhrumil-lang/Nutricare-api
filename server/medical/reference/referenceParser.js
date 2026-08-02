import { parseOperatorReference } from './operatorParser.js';
import { extractNumericRange } from './rangeExtractor.js';
import { extractTextualReference } from './textualReference.js';

/**
 * Parses one laboratory reference field without applying clinical meaning.
 * `raw` is deliberately returned unchanged, including report qualifiers such
 * as Male, Female, or Children reference labels.
 */
export function parseReferenceRange(raw) {
  if (typeof raw !== 'string') return null;

  const numericRange = extractNumericRange(raw);
  if (numericRange) return { raw, ...numericRange };

  const operatorReference = parseOperatorReference(raw);
  if (operatorReference) return { raw, ...operatorReference };

  const textualReference = extractTextualReference(raw);
  if (textualReference) return { raw, ...textualReference };

  return { raw };
}

export default parseReferenceRange;
