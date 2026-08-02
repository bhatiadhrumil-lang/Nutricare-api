import { aliasMap } from '../resolver/aliasMap.js';
import { normalizeAlias } from '../resolver/tokenizer.js';

function isDirectAliasMatch(label) {
  const normalized = normalizeAlias(label);
  return aliasMap.exact.has(label)
    || aliasMap.normalized.has(normalized)
    || aliasMap.caseInsensitive.has(normalized.toLocaleLowerCase());
}

/** Creates non-clinical operational metrics from a completed extraction pass. */
export function createPipelineMetrics({ lines, parameters, unmatched, durationMs }) {
  const fuzzyMatches = parameters.reduce((count, parameter) => (
    isDirectAliasMatch(parameter.source.label) ? count : count + 1
  ), 0);
  const confidenceTotal = parameters.reduce((total, parameter) => total + parameter.confidence, 0);

  return {
    totalOcrLines: lines,
    matchedParameters: parameters.length,
    unmatchedParameters: unmatched.length,
    averageConfidence: parameters.length ? Number((confidenceTotal / parameters.length).toFixed(2)) : 0,
    aliasMatches: parameters.length,
    fuzzyMatches,
    processingDurationMs: Number(durationMs.toFixed(2)),
  };
}

export default createPipelineMetrics;
