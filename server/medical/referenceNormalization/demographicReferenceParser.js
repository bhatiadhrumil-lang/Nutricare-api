import { DEMOGRAPHIC_LABEL_PATTERN } from './referencePatterns.js';

const LABELS = Object.freeze({
  male: { gender: 'male' }, female: { gender: 'female' }, infant: { ageGroup: 'infant' },
  child: { ageGroup: 'child' }, children: { ageGroup: 'child' }, adult: { ageGroup: 'adult' },
  'trimester 1': { pregnancyTrimester: 1 }, 'first trimester': { pregnancyTrimester: 1 },
  'trimester 2': { pregnancyTrimester: 2 }, 'second trimester': { pregnancyTrimester: 2 },
  'trimester 3': { pregnancyTrimester: 3 }, 'third trimester': { pregnancyTrimester: 3 },
  pregnancy: { pregnancy: true },
});

/** Extracts a leading demographic label without interpreting the reference. */
export function parseDemographicReference(raw) {
  if (typeof raw !== 'string') return null;
  const match = /^\s*(?<label>male|female|infant|child(?:ren)?|adult|trimester\s*[123]|first\s+trimester|second\s+trimester|third\s+trimester|pregnancy)\s*[:\-]?\s*(?<reference>.+?)\s*$/iu.exec(raw);
  if (!match?.groups) return null;
  const label = match.groups.label.toLocaleLowerCase().replace(/\s+/gu, ' ');
  const demographic = LABELS[label];
  return demographic ? { demographic, reference: match.groups.reference } : null;
}

export function containsDemographicLabel(raw) {
  return typeof raw === 'string' && DEMOGRAPHIC_LABEL_PATTERN.test(raw);
}

export default parseDemographicReference;
