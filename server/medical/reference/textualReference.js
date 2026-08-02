// Longest forms must be tested first so "Not Detected" is never reduced to
// "Detected", and "Non Reactive" is never reduced to "Reactive".
const TEXTUAL_REFERENCE = /\b(?<text>non[\s-]*reactive|not[\s-]*detected|negative|positive|reactive|detected|trace|absent)\b/iu;

/** Extracts a qualitative reference exactly as it appeared in the report. */
export function extractTextualReference(raw) {
  if (typeof raw !== 'string') return null;
  const match = TEXTUAL_REFERENCE.exec(raw);
  return match?.groups?.text ? { text: match.groups.text } : null;
}

export default extractTextualReference;
