import assert from 'node:assert/strict';
import test from 'node:test';
import { parseReferenceRange } from './referenceParser.js';

test('extracts CBC and liver numeric ranges exactly as printed', () => {
  assert.deepEqual(parseReferenceRange('13-17 g/dL'), { raw: '13-17 g/dL', low: '13', high: '17', unit: 'g/dL' });
  assert.deepEqual(parseReferenceRange(' 13.0 - 17.0 U/L '), { raw: ' 13.0 - 17.0 U/L ', low: '13.0', high: '17.0', unit: 'U/L' });
  assert.deepEqual(parseReferenceRange('4.5–11.0 10^3/µL'), { raw: '4.5–11.0 10^3/µL', low: '4.5', high: '11.0', unit: '10^3/µL' });
  assert.deepEqual(parseReferenceRange('0 to 40 U/L'), { raw: '0 to 40 U/L', low: '0', high: '40', unit: 'U/L' });
  assert.deepEqual(parseReferenceRange('4.5 — 11.O 10^3/µL'), { raw: '4.5 — 11.O 10^3/µL', low: '4.5', high: '11.O', unit: '10^3/µL' });
});

test('extracts kidney, hormone, and tumor-marker operator references', () => {
  assert.deepEqual(parseReferenceRange('<40 mg/dL'), { raw: '<40 mg/dL', operator: '<', value: '40', unit: 'mg/dL' });
  assert.deepEqual(parseReferenceRange('≤40 ng/mL'), { raw: '≤40 ng/mL', operator: '≤', value: '40', unit: 'ng/mL' });
  assert.deepEqual(parseReferenceRange('>20 mIU/mL'), { raw: '>20 mIU/mL', operator: '>', value: '20', unit: 'mIU/mL' });
  assert.deepEqual(parseReferenceRange('≥15 ng/mL'), { raw: '≥15 ng/mL', operator: '≥', value: '15', unit: 'ng/mL' });
});

test('extracts urine textual references with OCR punctuation and spacing preserved', () => {
  assert.deepEqual(parseReferenceRange('Negative'), { raw: 'Negative', text: 'Negative' });
  assert.deepEqual(parseReferenceRange('Non Reactive'), { raw: 'Non Reactive', text: 'Non Reactive' });
  assert.deepEqual(parseReferenceRange('Not-Detected'), { raw: 'Not-Detected', text: 'Not-Detected' });
  assert.deepEqual(parseReferenceRange('Trace'), { raw: 'Trace', text: 'Trace' });
  assert.deepEqual(parseReferenceRange('Absent'), { raw: 'Absent', text: 'Absent' });
});

test('retains sex and age reference qualifiers in raw text without interpreting them', () => {
  assert.deepEqual(parseReferenceRange('Male reference: 13.5 - 17.5 g/dL'), {
    raw: 'Male reference: 13.5 - 17.5 g/dL', low: '13.5', high: '17.5', unit: 'g/dL',
  });
  assert.deepEqual(parseReferenceRange('Female reference: 12.0-15.5 g/dL'), {
    raw: 'Female reference: 12.0-15.5 g/dL', low: '12.0', high: '15.5', unit: 'g/dL',
  });
  assert.deepEqual(parseReferenceRange('Children reference: 4.5 — 11.0 10^3/µL'), {
    raw: 'Children reference: 4.5 — 11.0 10^3/µL', low: '4.5', high: '11.0', unit: '10^3/µL',
  });
});
