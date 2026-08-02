/**
 * Calculates Jaro-Winkler similarity. It is resilient to single-character OCR
 * substitutions while remaining bounded between zero and one.
 *
 * @param {string} left First normalized string.
 * @param {string} right Second normalized string.
 * @returns {number} Similarity score between 0 and 1.
 */
export function jaroWinklerSimilarity(left, right) {
  if (left === right) return 1;
  if (!left || !right) return 0;

  const matchDistance = Math.max(Math.floor(Math.max(left.length, right.length) / 2) - 1, 0);
  const leftMatches = new Array(left.length).fill(false);
  const rightMatches = new Array(right.length).fill(false);
  let matches = 0;

  for (let index = 0; index < left.length; index += 1) {
    const start = Math.max(0, index - matchDistance);
    const end = Math.min(index + matchDistance + 1, right.length);
    for (let candidate = start; candidate < end; candidate += 1) {
      if (!rightMatches[candidate] && left[index] === right[candidate]) {
        leftMatches[index] = true;
        rightMatches[candidate] = true;
        matches += 1;
        break;
      }
    }
  }
  if (!matches) return 0;

  let transpositions = 0;
  let rightIndex = 0;
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    if (!leftMatches[leftIndex]) continue;
    while (!rightMatches[rightIndex]) rightIndex += 1;
    if (left[leftIndex] !== right[rightIndex]) transpositions += 1;
    rightIndex += 1;
  }

  const jaro = ((matches / left.length) + (matches / right.length)
    + ((matches - (transpositions / 2)) / matches)) / 3;
  let prefix = 0;
  while (prefix < 4 && prefix < left.length && left[prefix] === right[prefix]) prefix += 1;
  return jaro + (prefix * 0.1 * (1 - jaro));
}

/** @param {string} value @returns {string[]} */
export function trigrams(value) {
  const padded = `  ${value} `;
  if (padded.length < 3) return [padded];
  const grams = new Set();
  for (let index = 0; index <= padded.length - 3; index += 1) grams.add(padded.slice(index, index + 3));
  return [...grams];
}

/**
 * Selects the highest-scoring indexed candidate above a threshold.
 *
 * @param {string} key Normalized lookup key.
 * @param {Map<string, Set<string>>} trigramIndex Candidate-key trigram index.
 * @param {number} threshold Minimum accepted similarity.
 * @returns {{ key: string, similarity: number } | null} Best fuzzy match.
 */
export function findFuzzyMatch(key, trigramIndex, threshold) {
  const candidates = new Set();
  for (const gram of trigrams(key)) {
    for (const candidate of trigramIndex.get(gram) ?? []) candidates.add(candidate);
  }

  let best = null;
  for (const candidate of candidates) {
    const similarity = jaroWinklerSimilarity(key, candidate);
    if (similarity >= threshold && (!best || similarity > best.similarity)) {
      best = { key: candidate, similarity };
    }
  }
  return best;
}
