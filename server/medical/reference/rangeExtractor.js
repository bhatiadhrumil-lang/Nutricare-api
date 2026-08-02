// OCR can render a zero as O. Preserve the scanned token exactly.
const NUMBER = '[+-]?(?:[\\dO]+(?:\\.[\\dO]+)?|\\.[\\dO]+)';
const UNIT = '(?:(?:[x×]\\s*)?10\\s*(?:\\^|\\*\\*)?\\s*[+-]?\\d+\\s*\\/\\s*[A-Za-zµμ]+|%|[A-Za-zµμ]+\\s*\\/\\s*[A-Za-zµμ0-9²]+)';

/**
 * Extracts a numeric interval as printed. String values intentionally preserve
 * details such as trailing zeroes; conversion and normalization are later work.
 */
export function extractNumericRange(raw) {
  if (typeof raw !== 'string') return null;
  const expression = `(?<low>${NUMBER})\\s*(?:-|–|—|−|~|to)\\s*(?<high>${NUMBER})(?:\\s*(?<unit>${UNIT}))?`;
  const match = new RegExp(expression, 'iu').exec(raw);
  if (!match?.groups) return null;

  const result = { low: match.groups.low, high: match.groups.high };
  if (match.groups.unit) result.unit = match.groups.unit;
  return result;
}

export default extractNumericRange;
