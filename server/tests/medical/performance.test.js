const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const test = require('node:test');
const { fixture, expected, generateMetrics } = require('./helpers');

test('processes a representative five-page report under 500ms and generates validation metrics', async (t) => {
  const [
    { default: medicalPipeline },
    { aliasResolver },
    { parseReferenceRange },
  ] = await Promise.all([
    import('../../medical/pipeline/medicalPipeline.js'),
    import('../../medical/resolver/aliasResolver.js'),
    import('../../medical/reference/referenceParser.js'),
  ]);
  const reports = fixture('extraction-reports.json');
  const outcomes = expected('extraction-reports.json');
  const limits = expected('metrics.json');
  const fivePageBase = reports.find((report) => report.id === 'multi-page');
  const fivePageText = Array.from({ length: 5 }, () => fivePageBase.rawText).join('\n');

  const performanceStart = performance.now();
  const fivePageResult = await medicalPipeline.process({ ...fivePageBase, rawText: fivePageText, pageCount: 5 });
  const fivePageDuration = performance.now() - performanceStart;
  assert.ok(fivePageDuration < 500, `5-page report took ${fivePageDuration.toFixed(2)}ms`);
  assert.equal(fivePageResult.parameters.length, 30);

  const confidences = [];
  const durations = [];
  let parametersFound = 0;
  let aliasCorrect = 0;
  let aliasTotal = 0;
  let valueCorrect = 0;
  let valueTotal = 0;
  let referenceCorrect = 0;
  let referenceTotal = 0;

  for (let index = 0; index < reports.length; index += 1) {
    const start = performance.now();
    const result = await medicalPipeline.process(reports[index]);
    durations.push(performance.now() - start);
    const target = outcomes[index];
    parametersFound += result.parameters.length;

    target.parameters.forEach((targetParameter, parameterIndex) => {
      const parameter = result.parameters[parameterIndex];
      const resolved = aliasResolver(parameter.source.label);
      aliasTotal += 1;
      if (resolved?.id === targetParameter.parameterId) aliasCorrect += 1;
      valueTotal += 1;
      if (parameter.value === targetParameter.value) valueCorrect += 1;
      if ('referenceRange' in targetParameter) {
        referenceTotal += 1;
        if (parseReferenceRange(targetParameter.referenceRange).raw === parameter.referenceRange.raw) referenceCorrect += 1;
      }
      confidences.push(parameter.confidence);
    });
  }

  const metrics = generateMetrics({
    reportsProcessed: reports.length,
    parametersFound,
    aliasCorrect,
    aliasTotal,
    valueCorrect,
    valueTotal,
    referenceCorrect,
    referenceTotal,
    confidences,
    durations,
  });
  t.diagnostic(`medical metrics ${JSON.stringify(metrics)}`);

  assert.equal(metrics.aliasAccuracy, limits.aliasAccuracy);
  assert.equal(metrics.valueAccuracy, limits.valueAccuracy);
  assert.equal(metrics.referenceAccuracy, limits.referenceAccuracy);
  assert.ok(metrics.averageConfidence >= limits.minimumAverageConfidence);
  assert.ok(metrics.processingTimeAverage < limits.maximumProcessingTimeAverageMs);
});
