import assert from 'node:assert/strict';
import test from 'node:test';
import { detectCriticalValues } from './criticalEngine.js';
import { CRITICAL_RULES } from './criticalRules.js';
import { EMERGENCY_RULES } from './emergencyRules.js';

test('detects critical potassium levels and returns expected output schema', () => {
  const result = detectCriticalValues({
    parameter: 'potassium',
    value: 6.5,
    status: 'HIGH',
    severity: 'CRITICAL_HIGH',
  });

  assert.equal(result.parameter, 'potassium');
  assert.equal(result.status, 'HIGH');
  assert.equal(result.severity, 'CRITICAL_HIGH');
  assert.equal(result.critical, true);
  assert.equal(result.emergency, true);
  assert.equal(result.alertLevel, 'RED');
  assert.equal(result.clinicalPriority, 'EMERGENCY');
  assert.equal(result.recommendedAction, 'Immediate medical evaluation');
  assert.equal(result.aiPriority, 100);
  assert.deepEqual(result.warnings, []);
});

test('detects life-threatening emergency levels for critical biomarkers', () => {
  // Potassium life-threatening high (>= 7.0)
  const potRes = detectCriticalValues({ parameter: 'potassium', value: 7.2, status: 'HIGH', severity: 'CRITICAL_HIGH' });
  assert.equal(potRes.critical, true);
  assert.equal(potRes.emergency, true);
  assert.equal(potRes.alertLevel, 'RED');
  assert.equal(potRes.clinicalPriority, 'EMERGENCY');
  assert.equal(potRes.recommendedAction, 'Immediate emergency intervention required');
  assert.equal(potRes.aiPriority, 100);

  // Sodium critical low (<= 120) and life-threatening low (<= 115)
  const sodCrit = detectCriticalValues({ parameter: 'sodium', value: 118, status: 'LOW', severity: 'CRITICAL_LOW' });
  assert.equal(sodCrit.critical, true);
  assert.equal(sodCrit.alertLevel, 'RED');

  const sodLife = detectCriticalValues({ parameter: 'sodium', value: 110, status: 'LOW', severity: 'CRITICAL_LOW' });
  assert.equal(sodLife.critical, true);
  assert.equal(sodLife.emergency, true);
  assert.equal(sodLife.recommendedAction, 'Immediate emergency intervention required');

  // Troponin I high (>= 0.1 critical, >= 0.5 life-threatening)
  const tropCrit = detectCriticalValues({ parameter: 'troponin_i', value: 0.2, status: 'HIGH', severity: 'SEVERE_HIGH' });
  assert.equal(tropCrit.critical, true);
  assert.equal(tropCrit.alertLevel, 'RED');

  const tropLife = detectCriticalValues({ parameter: 'troponin_i', value: 0.8, status: 'HIGH', severity: 'CRITICAL_HIGH' });
  assert.equal(tropLife.emergency, true);
  assert.equal(tropLife.clinicalPriority, 'EMERGENCY');

  // Glucose critical low (<= 2.8) and high (>= 25.0)
  const glucLow = detectCriticalValues({ parameter: 'fasting_plasma_glucose', value: 2.2, status: 'LOW', severity: 'CRITICAL_LOW' });
  assert.equal(glucLow.critical, true);
  assert.equal(glucLow.alertLevel, 'RED');

  // INR high (>= 5.0 critical)
  const inrHigh = detectCriticalValues({ parameter: 'international_normalized_ratio', value: 6.0, status: 'HIGH', severity: 'CRITICAL_HIGH' });
  assert.equal(inrHigh.critical, true);
  assert.equal(inrHigh.alertLevel, 'RED');

  // Hemoglobin critical low (<= 60)
  const hbLow = detectCriticalValues({ parameter: 'hemoglobin', value: 55, status: 'LOW', severity: 'CRITICAL_LOW' });
  assert.equal(hbLow.critical, true);
  assert.equal(hbLow.emergency, true);

  // Platelets critical low (<= 20)
  const pltLow = detectCriticalValues({ parameter: 'platelet_count', value: 15, status: 'LOW', severity: 'CRITICAL_LOW' });
  assert.equal(pltLow.critical, true);

  // Creatinine critical high (>= 440)
  const creatHigh = detectCriticalValues({ parameter: 'creatinine', value: 500, status: 'HIGH', severity: 'CRITICAL_HIGH' });
  assert.equal(creatHigh.critical, true);

  // CRP high (>= 100)
  const crpHigh = detectCriticalValues({ parameter: 'c_reactive_protein', value: 150, status: 'HIGH', severity: 'SEVERE_HIGH' });
  assert.equal(crpHigh.critical, true);
});

test('handles boundary values correctly', () => {
  // Potassium threshold low = 2.8, high = 6.2
  const potLowBoundary = detectCriticalValues({ parameter: 'potassium', value: 2.8, status: 'LOW', severity: 'SEVERE_LOW' });
  assert.equal(potLowBoundary.critical, true);

  const potNormalBoundary = detectCriticalValues({ parameter: 'potassium', value: 4.0, status: 'NORMAL', severity: 'NORMAL' });
  assert.equal(potNormalBoundary.critical, false);
  assert.equal(potNormalBoundary.emergency, false);
  assert.equal(potNormalBoundary.alertLevel, 'GREEN');
  assert.equal(potNormalBoundary.clinicalPriority, 'LOW');
});

test('emits appropriate warnings for unknown parameters, missing rules, and missing values', () => {
  // Unknown parameter
  const unknownParam = detectCriticalValues({ parameter: 'unknown_biomarker_xyz', value: 100, status: 'HIGH', severity: 'HIGH' });
  assert.equal(unknownParam.warnings[0].code, 'UNKNOWN_PARAMETER');
  assert.equal(unknownParam.critical, false);

  // Parameter in catalog but missing critical rule
  const missingRule = detectCriticalValues({ parameter: 'biotin', value: 50, status: 'LOW', severity: 'MILD_LOW' });
  assert.equal(missingRule.warnings[0].code, 'MISSING_CRITICAL_RULE');

  // Missing value
  const missingVal = detectCriticalValues({ parameter: 'potassium', status: 'HIGH' });
  assert.equal(missingVal.warnings[0].code, 'MISSING_VALUE');

  // Invalid value
  const invalidVal = detectCriticalValues({ parameter: 'potassium', value: 'invalid_number', status: 'HIGH' });
  assert.equal(invalidVal.warnings[0].code, 'INVALID_VALUE');
});

test('ensures rules configurations are immutable objects', () => {
  assert.throws(() => {
    CRITICAL_RULES.potassium = null;
  });
  assert.throws(() => {
    EMERGENCY_RULES.potassium = null;
  });
});
