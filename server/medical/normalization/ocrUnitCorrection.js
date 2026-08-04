/** Repairs high-confidence, position-specific OCR confusions in unit text. */
export function correctOcrUnit(unit) {
  if (typeof unit !== 'string') return { unit: '', corrected: false };
  let corrected = unit;

  // `l` is routinely read as `1` or `I` by OCR, but only correct it where a
  // unit denominator is expected. This avoids mutating arbitrary unknown text.
  corrected = corrected
    .replace(/\/\s*d\s*[1i](?=$|\s|[),;])/giu, '/dL')
    .replace(/\/\s*m\s*[1i](?=$|\s|[),;])/giu, '/mL')
    .replace(/\/\s*n\s*[1i](?=$|\s|[),;])/giu, '/nL')
    .replace(/(mmo|µmo|μmo|umo)\s*[i1](?=\s*\/)/giu, '$1l')
    .replace(/\bm\s*[1i](?=\s*\/)/giu, 'mL')
    .replace(/\/\s*1(?=$|\s|[),;])/gu, '/L');

  // Enzyme units use an uppercase U; lowercase `u/L` is a common OCR error.
  corrected = corrected.replace(/^\s*u\s*\/\s*l\s*$/iu, 'U/L');
  return { unit: corrected, corrected: corrected !== unit };
}

export default correctOcrUnit;
