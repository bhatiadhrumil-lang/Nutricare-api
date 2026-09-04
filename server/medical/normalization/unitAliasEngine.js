import { UNIT_ALIAS_TABLE } from './unitAliasTable.js';
import { correctOcrUnit } from './ocrUnitCorrection.js';

const SUPERSCRIPTS = Object.freeze({ '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' });

export function toUnitLookupKey(unit) {
  return unit
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/gu, (character) => SUPERSCRIPTS[character])
    .normalize('NFKC')
    .replace(/[μµ]/gu, 'u')
    .replace(/[×x]\s*(?=10)/giu, '')
    .replace(/10\s*(?:e|\*|\^|~)?\s*([0-9]+)/giu, '10^$1')
    .replace(/\.(?!\d)/gu, '/')
    .replace(/_/gu, '/')
    .replace(/\/+/gu, '/')
    .replace(/\s+/gu, '')
    .replace(/²/gu, '2')
    .toLocaleLowerCase();
}

function invalid(originalUnit, code, message) {
  return { originalUnit, normalizedUnit: '', confidence: 0, normalizationType: 'invalid', warnings: [{ code, message, level: 'warning' }] };
}

/**
 * Produces canonical unit metadata without throwing. This lets downstream
 * validation preserve an OCR result even when its unit is not recognized.
 */
export function normalizeUnit(unit) {
  if (typeof unit !== 'string' || !unit.trim()) return invalid(unit ?? '', 'INVALID_FORMAT', 'Unit is missing or empty.');
  const originalUnit = unit;
  const ocr = correctOcrUnit(unit.trim());
  const lookupKey = toUnitLookupKey(ocr.unit);
  if (!lookupKey || /^\d+$/u.test(lookupKey)) return invalid(originalUnit, 'INVALID_FORMAT', `Unit "${originalUnit}" has an invalid format.`);

  const normalizedUnit = UNIT_ALIAS_TABLE[lookupKey];
  if (!normalizedUnit) {
    return { originalUnit, normalizedUnit: ocr.unit.trim(), confidence: 0, normalizationType: 'unknown', warnings: [{ code: 'UNKNOWN_UNIT', message: `Unit "${originalUnit}" is not recognized.`, level: 'warning' }] };
  }
  if (originalUnit.trim() === normalizedUnit) {
    return { originalUnit, normalizedUnit, confidence: 1, normalizationType: 'exact', warnings: [] };
  }
  if (ocr.corrected) {
    return { originalUnit, normalizedUnit, confidence: 0.88, normalizationType: 'ocr-correction', warnings: [{ code: 'OCR_CORRECTED', message: `Corrected OCR unit "${originalUnit}" to "${normalizedUnit}".`, level: 'warning' }] };
  }
  return { originalUnit, normalizedUnit, confidence: 1, normalizationType: 'alias', warnings: [{ code: 'ALIAS_NORMALIZED', message: `Normalized unit alias "${originalUnit}" to "${normalizedUnit}".`, level: 'warning' }] };
}

export default normalizeUnit;
