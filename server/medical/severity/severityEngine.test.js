import assert from 'node:assert/strict';
import test from 'node:test';
import { classifySeverity } from './severityEngine.js';

const lowHigh = { low: 13, high: 17 };

test('classifies CBC severity with parameter-specific boundaries', () => {
  assert.deepEqual(classifySeverity({ id: 'hemoglobin', value: 8.4, status: 'LOW', reference: lowHigh }), { id: 'hemoglobin', value: 8.4, status: 'LOW', severity: 'SEVERE_LOW', severityScore: 84, clinicalPriority: 'HIGH', warnings: [] });
  assert.equal(classifySeverity({ id: 'hemoglobin', value: 13, status: 'NORMAL', reference: lowHigh }).severity, 'NORMAL');
});

test('classifies kidney, liver, lipid, electrolyte, hormone, iron, and cardiac biomarkers', () => {
  assert.equal(classifySeverity({ id: 'creatinine', value: 5, status: 'HIGH', reference: { high: 1 } }).severity, 'CRITICAL_HIGH');
  assert.equal(classifySeverity({ id: 'alanine_aminotransferase', value: 250, status: 'HIGH', reference: { high: 40 } }).severity, 'SEVERE_HIGH');
  assert.equal(classifySeverity({ id: 'triglycerides', value: 300, status: 'HIGH', reference: { high: 150 } }).severity, 'MODERATE_HIGH');
  assert.equal(classifySeverity({ id: 'potassium', value: 2.4, status: 'LOW', reference: { low: 3.5 } }).severity, 'SEVERE_LOW');
  assert.equal(classifySeverity({ id: 'thyroid_stimulating_hormone', value: 20, status: 'HIGH', reference: { high: 4 } }).severity, 'SEVERE_HIGH');
  assert.equal(classifySeverity({ id: 'ferritin', value: 5, status: 'LOW', reference: { low: 20 } }).severity, 'SEVERE_LOW');
  assert.equal(classifySeverity({ id: 'troponin_i', value: 1, status: 'HIGH', reference: { high: 0.04 } }).severity, 'CRITICAL_HIGH');
  assert.equal(classifySeverity({ id: 'troponin_i', value: 1, status: 'HIGH', reference: { high: 0.04 } }).clinicalPriority, 'URGENT');
});

test('preserves critical status and derives emergency priority', () => {
  const result = classifySeverity({ id: 'sodium', value: 110, status: 'CRITICAL_LOW', reference: { low: 135 } });
  assert.equal(result.severity, 'CRITICAL_LOW');
  assert.equal(result.severityScore, 100);
  assert.equal(result.clinicalPriority, 'EMERGENCY');
});

test('returns warnings for unknown parameter, missing rules, references, and invalid values', () => {
  assert.equal(classifySeverity({ id: 'not_a_parameter', value: 1, status: 'HIGH', reference: { high: 1 } }).warnings[0].code, 'UNKNOWN_PARAMETER');
  assert.equal(classifySeverity({ id: 'biotin', value: 1, status: 'LOW', reference: { low: 3 } }).warnings[0].code, 'MISSING_SEVERITY_RULE');
  assert.equal(classifySeverity({ value: 1, status: 'HIGH', reference: { high: 1 } }).warnings[0].code, 'UNKNOWN_PARAMETER');
  assert.equal(classifySeverity({ id: 'hemoglobin', value: 1, status: 'LOW' }).warnings[0].code, 'MISSING_REFERENCE');
  assert.equal(classifySeverity({ id: 'hemoglobin', value: '8', status: 'LOW', reference: { low: 13 } }).warnings[0].code, 'INVALID_VALUE');
});

test('tests boundary thresholds and clinical priority mapping', () => {
  // Potassium low thresholds (boundary low = 3.5)
  // mild: ratio <= 1.0 (e.g. 3.4), moderate: ratio <= 0.85 (2.975), severe: ratio <= 0.7 (2.45), critical: ratio <= 0.6 (2.1)
  assert.equal(classifySeverity({ id: 'potassium', value: 3.4, status: 'LOW', reference: { low: 3.5 } }).severity, 'MILD_LOW');
  assert.equal(classifySeverity({ id: 'potassium', value: 2.9, status: 'LOW', reference: { low: 3.5 } }).severity, 'MODERATE_LOW');
  assert.equal(classifySeverity({ id: 'potassium', value: 2.4, status: 'LOW', reference: { low: 3.5 } }).severity, 'SEVERE_LOW');
  assert.equal(classifySeverity({ id: 'potassium', value: 2.0, status: 'LOW', reference: { low: 3.5 } }).severity, 'CRITICAL_LOW');

  // Verify priorities for each level
  assert.equal(classifySeverity({ id: 'potassium', value: 3.4, status: 'LOW', reference: { low: 3.5 } }).clinicalPriority, 'LOW');
  assert.equal(classifySeverity({ id: 'potassium', value: 2.9, status: 'LOW', reference: { low: 3.5 } }).clinicalPriority, 'MEDIUM');
  assert.equal(classifySeverity({ id: 'potassium', value: 2.4, status: 'LOW', reference: { low: 3.5 } }).clinicalPriority, 'HIGH');
  assert.equal(classifySeverity({ id: 'potassium', value: 2.0, status: 'LOW', reference: { low: 3.5 } }).clinicalPriority, 'URGENT');
});
