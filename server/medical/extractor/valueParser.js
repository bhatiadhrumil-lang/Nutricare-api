/**
 * Finds the first laboratory result value in text. Values retain their original
 * comparator/text while `number` is a JavaScript number for downstream use.
 */
export function parseValue(value) {
  if (typeof value !== 'string') return null;

  // Do not match a number embedded in a word (for example, the B12 in a label).
  const match = /(?:^|[\s:|,;=])(?<comparator><=|>=|<|>)?\s*(?<number>(?:\d{1,3}(?:,\d{3})+|\d+)(?:[.]\d+)?|\d*[.]\d+)(?=$|\s|[%/,:;|\[\]()])/u.exec(value);
  if (!match?.groups) return null;

  const raw = `${match.groups.comparator ?? ''}${match.groups.number}`;
  const number = Number(match.groups.number.replaceAll(',', ''));
  if (!Number.isFinite(number)) return null;

  const start = match.index + match[0].indexOf(raw);
  return {
    raw,
    number,
    comparator: match.groups.comparator || null,
    start,
    end: start + raw.length,
  };
}

export default parseValue;
