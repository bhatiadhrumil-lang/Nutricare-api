const assert = require('node:assert/strict');
const test = require('node:test');
const { fixture, expected } = require('./helpers');

test('integrates extraction, reference parsing, unmatched lines, and metadata', async () => {
  const { default: medicalPipeline } = await import('../../medical/pipeline/medicalPipeline.js');
  const reports = fixture('pipeline-reports.json');
  const outcomes = expected('pipeline-reports.json');

  for (let index = 0; index < reports.length; index += 1) {
    const report = reports[index];
    const result = await medicalPipeline.process(report);
    const target = outcomes[index];

    assert.equal(result.metadata.fileName, report.fileName);
    assert.equal(result.metadata.pageCount, report.pageCount);
    assert.equal(result.parameters.length, target.parameterCount, report.id);
    assert.equal(result.unmatched.length, target.unmatchedCount, report.id);
    assert.equal(result.statistics.fuzzyMatches, target.fuzzyMatches, report.id);
    assert.equal(result.statistics.matchedParameters, target.parameterCount, report.id);
    assert.ok(result.statistics.processingDurationMs >= 0, report.id);
  }
});
