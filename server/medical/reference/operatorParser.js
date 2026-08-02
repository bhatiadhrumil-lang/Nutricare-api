// OCR can render a zero as O. Keep it in the raw component rather than
// silently correcting it; normalization belongs to a later phase.
const NUMBER = '[+-]?(?:[\\dO]+(?:\\.[\\dO]+)?|\\.[\\dO]+)';
const UNIT = '(?:(?:[x×]\\s*)?10\\s*(?:\\^|\\*\\*)?\\s*[+-]?\\d+\\s*\\/\\s*[A-Za-zµμ]+|%|[A-Za-zµμ]+\\s*\\/\\s*[A-Za-zµμ0-9²]+)';

/** Extracts an inequality reference without changing its original symbols. */
export function parseOperatorReference(raw) {
  if (typeof raw !== 'string') return null;
  const match = new RegExp(`(?<operator><=|>=|≤|≥|<|>)\\s*(?<value>${NUMBER})(?:\\s*(?<unit>${UNIT}))?`, 'u').exec(raw);
  if (!match?.groups) return null;

  const result = { operator: match.groups.operator, value: match.groups.value };
  if (match.groups.unit) result.unit = match.groups.unit;
  return result;
}

export default parseOperatorReference;
