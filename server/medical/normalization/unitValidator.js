import { CANONICAL_UNITS } from './canonicalUnits.js';
import { normalizeUnit } from './unitAliasEngine.js';

export const VALIDATION_CODES = Object.freeze({
  VALID: 'VALID', UNKNOWN_UNIT: 'UNKNOWN_UNIT', INVALID_UNIT: 'INVALID_UNIT',
  INVALID_FORMAT: 'INVALID_FORMAT', UNIT_MISMATCH: 'UNIT_MISMATCH',
  ALREADY_NORMALIZED: 'ALREADY_NORMALIZED', OCR_CORRECTED: 'OCR_CORRECTED',
  ALIAS_NORMALIZED: 'ALIAS_NORMALIZED',
});

/** Backward-compatible string helper, now backed by the alias engine. */
export function normalizeUnitString(unit) {
  return normalizeUnit(unit).normalizedUnit;
}

export function validateUnit(parameterId, unit) {
  const normalization = normalizeUnit(unit);
  const paramConfig = CANONICAL_UNITS[parameterId];
  if (!paramConfig) {
    return { isValid: false, normalization, warning: { code: VALIDATION_CODES.UNKNOWN_UNIT, message: `Unknown parameter ID: ${parameterId}`, level: 'error' } };
  }
  const validUnits = Object.keys(paramConfig.conversionFactors);
  const isValid = validUnits.some((validUnit) => normalizeUnitString(validUnit) === normalization.normalizedUnit);
  return isValid
    ? { isValid: true, normalization }
    : { isValid: false, normalization, warning: { code: VALIDATION_CODES.UNKNOWN_UNIT, message: `Unit "${unit}" is not a recognized unit for ${parameterId}. Expected one of: ${validUnits.join(', ')}`, level: 'warning' } };
}

export function validateUnitFormat(unit) {
  const normalization = normalizeUnit(unit);
  if (normalization.normalizationType === 'invalid') return { isValid: false, normalization, warning: normalization.warnings[0] };
  if (/[^a-zA-Z0-9^°µμ×*\/\.\-_\s²³]/u.test(unit)) {
    return { isValid: false, normalization, warning: { code: VALIDATION_CODES.INVALID_FORMAT, message: `Unit "${unit}" contains invalid characters`, level: 'warning' } };
  }
  return { isValid: true, normalization };
}

export function isAlreadyNormalized(parameterId, unit) {
  const config = CANONICAL_UNITS[parameterId];
  return Boolean(config && normalizeUnit(unit).normalizedUnit === config.canonicalUnit);
}

export function validateParameter(parameter) {
  const { id: parameterId, value, unit } = parameter;
  const warnings = [];
  let isValid = true;
  if (value === null || value === undefined || value === '') {
    isValid = false;
    warnings.push({ code: VALIDATION_CODES.INVALID_FORMAT, message: `Missing value for ${parameterId}`, level: 'error' });
  }
  const formatValidation = validateUnitFormat(unit);
  if (!formatValidation.isValid) {
    isValid = false;
    warnings.push(formatValidation.warning);
  } else {
    const unitValidation = validateUnit(parameterId, unit);
    if (!unitValidation.isValid) {
      isValid = false;
      warnings.push(unitValidation.warning);
    }
    warnings.push(...formatValidation.normalization.warnings);
  }
  return { isValid, warnings, isAlreadyNormalized: isAlreadyNormalized(parameterId, unit), normalization: formatValidation.normalization };
}

export function checkUnitValidity(parameter) {
  const validation = validateParameter(parameter);
  return { warnings: validation.warnings, isValid: validation.isValid, normalization: validation.normalization };
}

/** Converts only where the catalog has an explicit, clinically sound factor. */
export function convertToCanonical(parameterId, value, unit) {
  const normalization = normalizeUnit(unit);
  const config = CANONICAL_UNITS[parameterId];
  if (!config || !Number.isFinite(value) || normalization.normalizationType === 'invalid') {
    return { value, unit, converted: false, normalization, warning: { code: VALIDATION_CODES.INVALID_FORMAT, message: 'Value, parameter, or unit cannot be converted.', level: 'warning' } };
  }
  const factor = config.conversionFactors[normalization.normalizedUnit];
  if (factor === undefined) {
    return { value, unit: normalization.normalizedUnit, converted: false, normalization, warning: { code: VALIDATION_CODES.UNKNOWN_UNIT, message: `No reliable conversion is configured for ${parameterId} in ${normalization.normalizedUnit}.`, level: 'warning' } };
  }
  return { value: value * factor, unit: config.canonicalUnit, converted: normalization.normalizedUnit !== config.canonicalUnit, normalization };
}

const unitValidator = Object.freeze({ normalizeUnitString, validateUnit, validateUnitFormat, validateParameter, checkUnitValidity, convertToCanonical });
export default unitValidator;
