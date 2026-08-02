const test = require('node:test');
const assert = require('node:assert/strict');
const { __test } = require('../services/gemini.service');

const { buildFallbackAnalysis } = __test;

test('fallback analysis uses report-specific details from extracted text', () => {
  const reportText = [
    'Hemoglobin: 13.2 g/dL',
    'Fasting Glucose: 118 mg/dL',
    'LDL Cholesterol: 142 mg/dL',
    'Vitamin D: 24 ng/mL',
  ].join('\n');

  const result = buildFallbackAnalysis(reportText);

  assert.ok(result.summary.toLowerCase().includes('glucose'));
  assert.ok(result.summary.toLowerCase().includes('ldl'));
  assert.ok(result.bloodParameters.some((param) => param.name.toLowerCase().includes('glucose')));
  assert.ok(result.bloodParameters.some((param) => param.name.toLowerCase().includes('vitamin')));
});
