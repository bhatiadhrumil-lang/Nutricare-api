import { parseLine } from './lineParser.js';

/**
 * Converts OCR text to raw, structured laboratory parameters. This module does
 * not normalize ranges, classify values, or provide medical interpretation.
 */
export function extractMedicalParameters(ocrText, options = {}) {
  const lines = typeof ocrText === 'string' ? ocrText.split(/\r?\n/u) : [];
  const parameters = [];
  const unmatched = [];

  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const parsed = parseLine(line, index + 1, options);
    if (parsed.parameter) parameters.push(parsed.parameter);
    else unmatched.push(parsed.unmatched);
  });

  const confidenceTotal = parameters.reduce((total, parameter) => total + parameter.confidence, 0);
  return {
    parameters,
    unmatched,
    statistics: {
      totalLines: lines.filter((line) => line.trim()).length,
      matchedLines: parameters.length,
      unmatchedLines: unmatched.length,
      parameterCount: parameters.length,
      averageConfidence: parameters.length ? Number((confidenceTotal / parameters.length).toFixed(2)) : 0,
    },
  };
}

export default extractMedicalParameters;
