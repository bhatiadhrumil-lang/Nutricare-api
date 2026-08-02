const fs = require('fs');
const path = require('path');

const MEDICAL_TEST_ROOT = __dirname;

function loadJson(folder, name) {
  return JSON.parse(fs.readFileSync(path.join(MEDICAL_TEST_ROOT, folder, name), 'utf8'));
}

function fixture(name) {
  return loadJson('fixtures', name);
}

function expected(name) {
  return loadJson('expected', name);
}

function accuracy(correct, total) {
  return total === 0 ? 0 : Number((correct / total).toFixed(4));
}

/** Produces the common validation metrics requested for the medical engine. */
function generateMetrics({ reportsProcessed, parametersFound, aliasCorrect, aliasTotal, valueCorrect, valueTotal, referenceCorrect, referenceTotal, confidences, durations }) {
  return {
    reportsProcessed,
    parametersFound,
    aliasAccuracy: accuracy(aliasCorrect, aliasTotal),
    valueAccuracy: accuracy(valueCorrect, valueTotal),
    referenceAccuracy: accuracy(referenceCorrect, referenceTotal),
    averageConfidence: confidences.length
      ? Number((confidences.reduce((sum, value) => sum + value, 0) / confidences.length).toFixed(2))
      : 0,
    processingTimeAverage: durations.length
      ? Number((durations.reduce((sum, value) => sum + value, 0) / durations.length).toFixed(2))
      : 0,
  };
}

module.exports = { fixture, expected, generateMetrics };
