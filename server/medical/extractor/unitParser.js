const UNIT_START = /^[\s:|,;=\-]*((?:[x×]\s*)?10\s*(?:\^|\*\*)?\s*[+-]?\d+\s*\/\s*[a-zµμ]+|[a-zµμ%]+(?:\s*(?:\/|per)\s*[a-zµμ]+)?)/iu;

function unitKey(value) {
  return value
    .normalize('NFKC')
    .replace(/[μ]/g, 'µ')
    .replace(/\s+/g, '')
    .toLocaleLowerCase();
}

/**
 * Extracts a unit immediately following a result. Catalog units are preferred,
 * while the grammar fallback keeps the parser useful as the catalog grows.
 */
export function parseUnit(text, parameter) {
  if (typeof text !== 'string') return null;
  const leading = /^[\s:|,;=\-]*/u.exec(text)?.[0].length ?? 0;
  const remaining = text.slice(leading);
  const catalogUnits = parameter?.units ?? [];

  for (const unit of catalogUnits) {
    const escaped = unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
    const match = new RegExp(`^${escaped}(?=$|\\s|[,:;|\\[\\]()])`, 'iu').exec(remaining);
    if (match) {
      return { raw: match[0], unit: unit, start: leading, end: leading + match[0].length, catalogMatch: true };
    }
  }

  const match = UNIT_START.exec(text);
  if (!match) return null;
  return {
    raw: match[1].trim(),
    unit: match[1].trim(),
    start: match.index + match[0].indexOf(match[1]),
    end: match.index + match[0].indexOf(match[1]) + match[1].length,
    catalogMatch: catalogUnits.some((unit) => unitKey(unit) === unitKey(match[1])),
  };
}

export default parseUnit;
