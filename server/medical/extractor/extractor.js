import { parseLine } from './lineParser.js';

/**
 * True when a line looks like a bare reference interval without a parameter
 * label — e.g. "12.0 - 15.0", "70 to 100 mg/dL", "<40 U/L".
 * Used to decide whether an unmatched line may be a table row fragment that
 * belongs to a neighbouring line (pdf-parse frequently splits lab tables so
 * the label, the value and the reference range land on separate lines).
 */
function looksLikeBareRange(line) {
  if (typeof line !== 'string') return false;
  const text = line.trim();
  if (!text) return false;
  // Operator-led reference: "<40", ">= 5.6", "≤ 100 mg/dL".
  if (/^[<≤>=≥]+\s*\d/iu.test(text)) return true;
  // Spanned interval: "12.0 - 15.0", "12 - 15 g/dL", "70 to 100".
  if (/\d\s*(?:[-–—]|to)\s*\d/iu.test(text)) return true;
  return false;
}

/**
 * Second extraction pass: re-attempts unmatched lines by rejoining table row
 * fragments that landed on adjacent lines.
 *
 * Sweep 1 (label + value): a label-only line ("Hemoglobin",
 * `value_not_found`) is joined with the immediately following unmatched line
 * ("13.2 g/dL 12.0 - 15.0", `parameter_not_found`) and re-parsed.
 *
 * Sweep 2 (trailing range): a parsed parameter that has no reference range
 * absorbs an immediately following unmatched bare-range line
 * ("12.0 - 15.0") and is re-parsed with the range attached.
 *
 * Both sweeps are conservative: a merge is only kept when the joined line
 * parses into a parameter, otherwise the original unmatched records survive.
 */
function recoverTableFragments(entries, parameters, sourceTextOf, unmatched, options) {
  const consumed = new Set();
  // Entries index at which each parameter's source text ends (single-line
  // parameters end at their own line; sweep-1 merges end at the value line).
  const endIndexOf = new Map();
  for (const entry of entries) {
    if (entry.result.parameter) endIndexOf.set(entry.result.parameter, entry.index);
  }

  // Sweep 1: label-only line + following unmatched line.
  for (const entry of entries) {
    if (consumed.has(entry.index) || entry.result.parameter) continue;
    if (entry.result.unmatched?.reason !== 'value_not_found') continue;
    const next = entries[entry.index + 1];
    if (!next || consumed.has(next.index) || next.result.parameter) continue;
    const mergedText = `${entry.text} ${next.text}`;
    const reparsed = parseLine(mergedText, entry.lineNumber, options);
    if (reparsed.parameter) {
      parameters.push(reparsed.parameter);
      sourceTextOf.set(reparsed.parameter, mergedText);
      endIndexOf.set(reparsed.parameter, next.index);
      consumed.add(entry.index);
      consumed.add(next.index);
    }
  }

  // Sweep 2: attach a trailing bare-range line to a reference-less parameter.
  // Parameters are visited in document order so a shared range line is claimed
  // by the nearest preceding parameter.
  const ordered = [...parameters].sort(
    (a, b) => (endIndexOf.get(a) ?? -1) - (endIndexOf.get(b) ?? -1),
  );

  for (const parameter of ordered) {
    if (parameter.referenceRange != null) continue;
    const endIdx = endIndexOf.get(parameter);
    if (endIdx == null || endIdx < 0) continue;
    const next = entries[endIdx + 1];
    if (!next || consumed.has(next.index) || next.result.parameter) continue;
    if (!looksLikeBareRange(next.text)) continue;
    const mergedText = `${sourceTextOf.get(parameter)} ${next.text}`;
    const reparsed = parseLine(mergedText, parameter.source.lineNumber, options);
    if (reparsed.parameter && reparsed.parameter.referenceRange != null) {
      Object.assign(parameter, reparsed.parameter);
      sourceTextOf.set(parameter, mergedText);
      consumed.add(next.index);
      endIndexOf.set(parameter, next.index);
    }
  }

  const remaining = entries
    .filter((entry) => !entry.result.parameter && !consumed.has(entry.index))
    .map((entry) => entry.result.unmatched);
  unmatched.length = 0;
  unmatched.push(...remaining);
}

/**
 * Converts OCR text to raw, structured laboratory parameters. This module does
 * not normalize ranges, classify values, or provide medical interpretation.
 *
 * Beyond single-line parsing, a conservative second pass rejoins table row
 * fragments that text extraction split across adjacent lines (label on one
 * line, value/reference on the next). Merges are only kept when the joined
 * line parses; everything else is reported as unmatched exactly as before.
 */
export function extractMedicalParameters(ocrText, options = {}) {
  const rawLines = typeof ocrText === 'string' ? ocrText.split(/\r?\n/u) : [];
  const entries = [];
  rawLines.forEach((line, index) => {
    if (!line.trim()) return;
    entries.push({
      index: entries.length,
      text: line,
      lineNumber: index + 1,
      result: parseLine(line, index + 1, options),
    });
  });

  const parameters = [];
  const unmatched = [];
  // Full source text behind each parameter (single line, or the joined text
  // of a sweep-1 merge) — used when a trailing range line is attached.
  const sourceTextOf = new Map();

  for (const entry of entries) {
    if (entry.result.parameter) {
      parameters.push(entry.result.parameter);
      sourceTextOf.set(entry.result.parameter, entry.text);
    } else {
      unmatched.push(entry.result.unmatched);
    }
  }

  if (unmatched.length > 0) {
    recoverTableFragments(entries, parameters, sourceTextOf, unmatched, options);
  }

  const confidenceTotal = parameters.reduce((total, parameter) => total + parameter.confidence, 0);
  return {
    parameters,
    unmatched,
    statistics: {
      totalLines: entries.length,
      matchedLines: parameters.length,
      unmatchedLines: unmatched.length,
      parameterCount: parameters.length,
      averageConfidence: parameters.length ? Number((confidenceTotal / parameters.length).toFixed(2)) : 0,
    },
  };
}

export default extractMedicalParameters;
