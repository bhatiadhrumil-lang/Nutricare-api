const assert = require('node:assert/strict');
const test = require('node:test');
const { fixture, expected, generateMetrics } = require('./helpers');

test('extracts values, comparators, units, OCR noise, multi-column, and multi-page reports', async (t) => {
  const { extractMedicalParameters } = await import('../../medical/extractor/extractor.js');
  const reports = fixture('extraction-reports.json');
  const outcomes = expected('extraction-reports.json');
  const confidences = [];
  let valueCorrect = 0;
  let valueTotal = 0;
  let parametersFound = 0;

  reports.forEach((report, index) => {
    const result = extractMedicalParameters(report.rawText);
    const target = outcomes[index];
    assert.equal(result.parameters.length, target.parameters.length, report.id);
    assert.equal(result.unmatched.length, target.unmatchedLines, report.id);
    parametersFound += result.parameters.length;

    target.parameters.forEach((parameter, parameterIndex) => {
      const actual = result.parameters[parameterIndex];
      assert.equal(actual.parameterId, parameter.parameterId, `${report.id} parameter ID`);
      assert.equal(actual.value, parameter.value, `${report.id} value`);
      assert.equal(actual.unit, parameter.unit, `${report.id} unit`);
      if ('comparator' in parameter) assert.equal(actual.comparator, parameter.comparator, `${report.id} comparator`);
      if ('referenceRange' in parameter) assert.equal(actual.referenceRange, parameter.referenceRange, `${report.id} reference`);
      valueCorrect += 1;
      valueTotal += 1;
      confidences.push(actual.confidence);
    });
  });

  const metrics = generateMetrics({
    reportsProcessed: reports.length, parametersFound, aliasCorrect: 0, aliasTotal: 0,
    valueCorrect, valueTotal, referenceCorrect: 0, referenceTotal: 0, confidences, durations: [],
  });
  t.diagnostic(`medical metrics ${JSON.stringify(metrics)}`);
  assert.equal(metrics.valueAccuracy, 1);
});
