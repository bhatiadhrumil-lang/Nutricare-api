// Live probe: drive analyzeReport() with the credentials in server/.env.
// Prints only a fingerprint of the result (never the raw text/secrets).
'use strict';
require('dotenv').config();
const path = require('path');
process.chdir(path.join(__dirname, '..'));
require('dotenv').config({ override: false });

const ai = require('../services/ai.service.js');

const SAMPLE = [
  'Hemoglobin 13.2 g/dL',
  'Fasting Glucose 6.4 mmol/L',
  'HbA1c 6.8 %',
  'LDL Cholesterol 140 mg/dL',
  'HDL Cholesterol 38 mg/dL',
  'Triglycerides 210 mg/dL',
  'Vitamin D 22 ng/mL',
].join('\n');

(async () => {
  const t0 = Date.now();
  try {
    const result = await ai.analyzeReport(SAMPLE);
    const ms = Date.now() - t0;
    const looksLikeFallback =
      result.confidence === 'Medium' && result.disease === 'General wellness review';
    console.log(JSON.stringify({
      lookLikeFallback: looksLikeFallback,
      disease: result.disease,
      confidence: result.confidence,
      summaryLen: (result.summary || '').length,
      summaryHead: (result.summary || '').slice(0, 180),
      bloodParams: (result.bloodParameters || []).length,
      tookMs: ms,
    }, null, 2));
  } catch (e) {
    console.log(JSON.stringify({ error: e.message, tookMs: Date.now() - t0 }, null, 2));
    process.exit(2);
  }
})();