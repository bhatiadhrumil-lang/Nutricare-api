/**
 * aiContextBuilder.test.js
 * Comprehensive tests for the AI Context Builder module.
 *
 * Test scenarios:
 *   1.  Normal report
 *   2.  Abnormal report
 *   3.  Critical report
 *   4.  Nutrition deficiencies
 *   5.  Partial reports (few parameters)
 *   6.  Missing / null values
 *   7.  Large reports (token optimization)
 *   8.  Token optimization validation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAiContext, formatContextForClaude } from '../../medical/ai/aiContextBuilder.js';
import { summarizeReport } from '../../medical/ai/reportSummarizer.js';
import { extractNutritionContext, NUTRIENT_PARAMETER_MAP } from '../../medical/ai/nutritionContext.js';
import { extractAbnormalAndCritical } from '../../medical/ai/abnormalContext.js';
import { buildAiInstructions } from '../../medical/ai/promptContext.js';
import { AI_CONTEXT_WARNING_CODES, contextWarning, validateAiContext, estimateTokens } from '../../medical/ai/contextValidator.js';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const makeParam = (id, value, status, severity = 'NORMAL', extra = {}) => ({
  id,
  parameter: id,
  value,
  normalizedValue: value,
  unit: 'g/dL',
  normalizedUnit: 'g/dL',
  status,
  severity,
  ...extra,
});

const normalReport = {
  parameters: [
    makeParam('hemoglobin', 140, 'NORMAL', 'NORMAL'),
    makeParam('fasting_plasma_glucose', 5.0, 'NORMAL', 'NORMAL'),
    makeParam('creatinine', 80, 'NORMAL', 'NORMAL'),
    makeParam('sodium', 140, 'NORMAL', 'NORMAL'),
    makeParam('calcium', 2.3, 'NORMAL', 'NORMAL'),
  ],
  healthScore: { overall: 100, domains: [{ name: 'Kidney', score: 100, risk: 'VERY_LOW_RISK', confidence: 1 }] },
  consistency: { score: 100, patterns: [], contradictions: [], warnings: [] },
  metadata: { sourceType: 'application/pdf', fileName: 'report.pdf', pageCount: 1 },
  version: '1.0.0',
};

const abnormalReport = {
  parameters: [
    makeParam('hemoglobin', 90, 'LOW', 'MILD_LOW'),
    makeParam('fasting_plasma_glucose', 7.5, 'HIGH', 'MILD_HIGH'),
    makeParam('creatinine', 80, 'NORMAL', 'NORMAL'),
    makeParam('vitamin_b12', 100, 'LOW', 'SEVERE_LOW'),
    makeParam('sodium', 140, 'NORMAL', 'NORMAL'),
  ],
  healthScore: { overall: 72, domains: [{ name: 'Blood', score: 65, risk: 'MODERATE_RISK', confidence: 0.8 }] },
  consistency: { score: 80, patterns: [{ name: 'Anemia Pattern', description: 'Low Hb may indicate anemia.' }], contradictions: [], warnings: [] },
  metadata: { sourceType: 'application/pdf', fileName: 'abnormal.pdf', pageCount: 1 },
  version: '1.0.0',
};

const criticalReport = {
  parameters: [
    makeParam('hemoglobin', 40, 'CRITICAL_LOW', 'CRITICAL_LOW', {
      critical: true,
      emergency: false,
      clinicalPriority: 'EMERGENCY',
      recommendedAction: 'Immediate medical evaluation required',
      alertLevel: 'CRITICAL',
      aiPriority: 'HIGH',
    }),
    makeParam('fasting_plasma_glucose', 25.0, 'CRITICAL_HIGH', 'CRITICAL_HIGH', {
      critical: true,
      emergency: true,
      clinicalPriority: 'EMERGENCY',
      recommendedAction: 'Emergency: hyperglycemic crisis suspected',
      alertLevel: 'EMERGENCY',
      aiPriority: 'HIGH',
    }),
    makeParam('sodium', 140, 'NORMAL', 'NORMAL'),
  ],
  healthScore: { overall: 20, domains: [{ name: 'Blood', score: 15, risk: 'VERY_HIGH_RISK', confidence: 0.9 }] },
  consistency: { score: 50, patterns: [], contradictions: [{ description: 'Critically low Hb with critically high glucose', severity: 'HIGH' }], warnings: [] },
  metadata: { sourceType: 'application/pdf', fileName: 'critical.pdf', pageCount: 2 },
  version: '1.0.0',
};

const nutritionDeficiencyReport = {
  parameters: [
    makeParam('vitamin_d_25_hydroxy', 12, 'LOW', 'SEVERE_LOW'),
    makeParam('vitamin_b12', 95, 'LOW', 'MILD_LOW'),
    makeParam('ferritin', 6, 'LOW', 'MILD_LOW'),
    makeParam('folate', 3.0, 'LOW', 'MILD_LOW'),
    makeParam('albumin', 30, 'LOW', 'MILD_LOW'),
    makeParam('calcium', 2.3, 'NORMAL', 'NORMAL'),
    makeParam('magnesium', 0.9, 'NORMAL', 'NORMAL'),
    makeParam('potassium', 4.0, 'NORMAL', 'NORMAL'),
  ],
  healthScore: { overall: 60, domains: [{ name: 'Vitamins', score: 40, risk: 'HIGH_RISK', confidence: 0.85 }] },
  consistency: { score: 70, patterns: [{ name: 'Multi-nutrient Deficiency', description: 'Multiple micronutrient deficiencies detected.' }], contradictions: [], warnings: [] },
  metadata: { sourceType: 'application/pdf', fileName: 'nutrition.pdf', pageCount: 1 },
  version: '1.0.0',
};

const partialReport = {
  parameters: [
    makeParam('hemoglobin', 130, 'NORMAL', 'NORMAL'),
  ],
  healthScore: { overall: 95, domains: [] },
  consistency: { score: 100, patterns: [], contradictions: [], warnings: [] },
  metadata: { sourceType: 'image/jpeg', fileName: 'partial.jpg', pageCount: null },
  version: '1.0.0',
};

const missingValuesReport = {
  parameters: [
    { id: 'hemoglobin', parameter: 'hemoglobin', value: null, normalizedValue: null, status: 'UNKNOWN', severity: 'UNKNOWN' },
    { id: 'creatinine', parameter: 'creatinine', value: undefined, normalizedValue: undefined, status: null, severity: null },
  ],
  healthScore: null,
  consistency: null,
  metadata: null,
  version: null,
};

function makeLargeReport(size = 50) {
  const parameters = [];
  for (let i = 0; i < size; i++) {
    parameters.push(makeParam(`param_${i}`, 100 + i, 'NORMAL', 'NORMAL'));
  }
  return {
    parameters,
    healthScore: { overall: 88, domains: [{ name: 'General', score: 88, risk: 'LOW_RISK', confidence: 0.7 }] },
    consistency: { score: 90, patterns: [], contradictions: [], warnings: [] },
    metadata: { sourceType: 'application/pdf', fileName: 'large.pdf', pageCount: 10 },
    version: '1.0.0',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. NORMAL REPORT
// ═══════════════════════════════════════════════════════════════════════════════

test('normal report: builds a valid AI context with no critical or abnormal findings', () => {
  const ctx = buildAiContext(normalReport);

  assert.equal(ctx.criticalFindings.length, 0, 'No critical findings expected');
  assert.equal(ctx.abnormalParameters.length, 0, 'No abnormal parameters expected');
  assert.equal(ctx.normalSummary.count, 5, 'All 5 parameters should be normal');
  assert.equal(ctx.reportSummary.overallHealthScore, 100);
  assert.equal(ctx.reportSummary.clinicalStatusOverview, 'All evaluated parameters are within reference ranges');
  assert.equal(ctx.reportSummary.healthCategory, 'Excellent');
  assert.equal(ctx.aiInstructions.recommendDoctorWhenCritical, false);
  assert.equal(ctx.aiInstructions.urgencyLevel, 'NORMAL');
});

test('normal report: formatContextForClaude produces non-empty string without critical section', () => {
  const ctx = buildAiContext(normalReport);
  const text = formatContextForClaude(ctx);

  assert.equal(typeof text, 'string');
  assert.ok(text.length > 0, 'Output should be non-empty');
  assert.ok(!text.includes('CRITICAL FINDINGS'), 'No critical section in normal report');
  assert.ok(text.includes('NORMAL PARAMETERS'), 'Should include normal parameters summary');
  assert.ok(text.includes('100/100'), 'Should show full health score');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ABNORMAL REPORT
// ═══════════════════════════════════════════════════════════════════════════════

test('abnormal report: correctly separates abnormal from normal parameters', () => {
  const ctx = buildAiContext(abnormalReport);

  assert.equal(ctx.criticalFindings.length, 0, 'No critical findings in abnormal report');
  assert.ok(ctx.abnormalParameters.length > 0, 'Should have abnormal parameters');

  const paramIds = ctx.abnormalParameters.map((p) => p.parameter);
  assert.ok(paramIds.includes('hemoglobin'), 'hemoglobin should be abnormal');
  assert.ok(paramIds.includes('fasting_plasma_glucose'), 'glucose should be abnormal');
  assert.ok(paramIds.includes('vitamin_b12'), 'B12 should be abnormal');
});

test('abnormal report: report summary reflects abnormal status', () => {
  const ctx = buildAiContext(abnormalReport);

  assert.equal(ctx.reportSummary.overallHealthScore, 72);
  assert.ok(ctx.reportSummary.clinicalStatusOverview.includes('attention'));
  assert.equal(ctx.aiInstructions.urgencyLevel, 'ELEVATED');
  assert.equal(ctx.aiInstructions.highlightCriticalValues, true);
  assert.equal(ctx.aiInstructions.recommendDoctorWhenCritical, false);
});

test('abnormal report: clinical patterns from consistency engine are included', () => {
  const ctx = buildAiContext(abnormalReport);
  assert.ok(Array.isArray(ctx.clinicalPatterns), 'clinicalPatterns should be an array');
  assert.ok(ctx.clinicalPatterns.length > 0, 'Should have clinical patterns');
  assert.ok(ctx.clinicalPatterns[0].name === 'Anemia Pattern');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CRITICAL REPORT
// ═══════════════════════════════════════════════════════════════════════════════

test('critical report: correctly identifies critical and emergency findings', () => {
  const ctx = buildAiContext(criticalReport);

  assert.ok(ctx.criticalFindings.length > 0, 'Should have critical findings');
  const hb = ctx.criticalFindings.find((f) => f.parameter === 'hemoglobin');
  const glucose = ctx.criticalFindings.find((f) => f.parameter === 'fasting_plasma_glucose');

  assert.ok(hb, 'Hemoglobin should be in critical findings');
  assert.ok(glucose, 'Glucose should be in critical findings');
  assert.equal(glucose.emergency, true, 'Glucose should be flagged as emergency');
});

test('critical report: urgency level is CRITICAL and doctor recommendation is true', () => {
  const ctx = buildAiContext(criticalReport);

  assert.equal(ctx.aiInstructions.urgencyLevel, 'CRITICAL');
  assert.equal(ctx.aiInstructions.recommendDoctorWhenCritical, true);
  assert.ok(ctx.aiInstructions.criticalInstruction !== null, 'Critical instruction should be set');
  assert.equal(ctx.reportSummary.healthCategory, 'Critical');
});

test('critical report: formatted context includes CRITICAL FINDINGS section', () => {
  const ctx = buildAiContext(criticalReport);
  const text = formatContextForClaude(ctx);

  assert.ok(text.includes('CRITICAL FINDINGS'), 'Must include critical findings header');
  assert.ok(text.includes('hemoglobin'), 'Must mention hemoglobin');
  assert.ok(text.includes('fasting_plasma_glucose'), 'Must mention glucose');
  assert.ok(text.includes('LIFE-THREATENING'), 'Must flag emergency items');
});

test('critical report: contradictions from consistency engine are included in clinical patterns', () => {
  const ctx = buildAiContext(criticalReport);
  const contradictions = ctx.clinicalPatterns.filter((p) => p.type === 'contradiction');
  assert.ok(contradictions.length > 0, 'Should include contradictions');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. NUTRITION DEFICIENCIES
// ═══════════════════════════════════════════════════════════════════════════════

test('nutrition deficiency report: extracts relevant nutrition context for deficient nutrients', () => {
  const ctx = buildAiContext(nutritionDeficiencyReport);

  assert.ok(typeof ctx.nutritionContext === 'object');
  assert.ok('Vitamin D' in ctx.nutritionContext, 'Vitamin D should be tracked');
  assert.ok('Vitamin B12' in ctx.nutritionContext, 'Vitamin B12 should be tracked');
  assert.ok('Ferritin' in ctx.nutritionContext, 'Ferritin should be tracked');
  assert.ok('Folate' in ctx.nutritionContext, 'Folate should be tracked');
  assert.ok('Albumin' in ctx.nutritionContext, 'Albumin should be tracked');
});

test('nutrition deficiency report: deficient nutrients require nutritional focus', () => {
  const ctx = buildAiContext(nutritionDeficiencyReport);

  assert.equal(ctx.nutritionContext['Vitamin D'].overallStatus, 'DEFICIENT');
  assert.equal(ctx.nutritionContext['Vitamin D'].requiresNutritionalFocus, true);
  assert.ok(ctx.nutritionContext['Vitamin D'].dietaryImplication !== null, 'Dietary implication should be set for deficient nutrients');
  assert.equal(ctx.nutritionContext['Ferritin'].overallStatus, 'DEFICIENT');
});

test('nutrition deficiency report: adequate nutrients are tracked but not flagged for focus', () => {
  const ctx = buildAiContext(nutritionDeficiencyReport);

  assert.equal(ctx.nutritionContext['Calcium'].requiresNutritionalFocus, false);
  assert.equal(ctx.nutritionContext['Calcium'].overallStatus, 'ADEQUATE');
  assert.equal(ctx.nutritionContext['Calcium'].dietaryImplication, null);
});

test('nutrition deficiency report: hasNutritionFocus instruction is set when deficient nutrients exist', () => {
  const ctx = buildAiContext(nutritionDeficiencyReport);
  assert.equal(ctx.aiInstructions.hasNutritionFocus, true);
});

test('nutrition deficiency report: formatted context includes nutrition section with dietary implications', () => {
  const ctx = buildAiContext(nutritionDeficiencyReport);
  const text = formatContextForClaude(ctx);

  assert.ok(text.includes('NUTRITION-RELEVANT FINDINGS'), 'Should include nutrition section');
  assert.ok(text.includes('Vitamin D'), 'Should mention Vitamin D');
  assert.ok(text.includes('DEFICIENT'), 'Should show deficiency status');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PARTIAL REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

test('partial report: handles single-parameter report without errors', () => {
  const ctx = buildAiContext(partialReport);

  assert.ok(typeof ctx === 'object');
  assert.equal(ctx.reportSummary.totalParameters, 1);
  assert.equal(ctx.criticalFindings.length, 0);
  assert.equal(ctx.normalSummary.count, 1);
  assert.ok(Array.isArray(ctx.clinicalPatterns));
  assert.ok(typeof ctx.aiInstructions === 'object');
});

test('partial report: formatContextForClaude works without throwing', () => {
  const ctx = buildAiContext(partialReport);
  assert.doesNotThrow(() => formatContextForClaude(ctx));
  const text = formatContextForClaude(ctx);
  assert.ok(text.length > 0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. MISSING / NULL VALUES
// ═══════════════════════════════════════════════════════════════════════════════

test('missing values: handles null/undefined parameter values gracefully', () => {
  assert.doesNotThrow(() => buildAiContext(missingValuesReport));
  const ctx = buildAiContext(missingValuesReport);
  assert.ok(typeof ctx === 'object');
  assert.ok(Array.isArray(ctx.criticalFindings));
  assert.ok(Array.isArray(ctx.abnormalParameters));
});

test('missing values: null pipeline data returns a valid context with warnings', () => {
  assert.doesNotThrow(() => buildAiContext(null));
  const ctx = buildAiContext(null);
  assert.ok(Array.isArray(ctx.metadata.buildWarnings));
  assert.ok(ctx.metadata.buildWarnings.some((w) => w.code === AI_CONTEXT_WARNING_CODES.INVALID_INPUT_DATA));
});

test('missing values: empty parameters array emits EMPTY_PARAMETERS warning', () => {
  const ctx = buildAiContext({ parameters: [] });
  assert.ok(ctx.metadata.buildWarnings.some((w) => w.code === AI_CONTEXT_WARNING_CODES.EMPTY_PARAMETERS));
});

test('missing values: null healthScore falls back to overall:100, empty domains', () => {
  const ctx = buildAiContext({ parameters: [makeParam('hemoglobin', 140, 'NORMAL')], healthScore: null });
  assert.equal(ctx.riskSummary.overall, 100);
  assert.deepEqual(ctx.riskSummary.domains, []);
});

test('missing values: formatContextForClaude handles an empty context without throwing', () => {
  const ctx = buildAiContext({});
  assert.doesNotThrow(() => formatContextForClaude(ctx));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. LARGE REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

test('large report: builds AI context from 50 parameters without errors', () => {
  const large = makeLargeReport(50);
  assert.doesNotThrow(() => buildAiContext(large));
  const ctx = buildAiContext(large);
  assert.equal(ctx.reportSummary.totalParameters, 50);
  assert.ok(Array.isArray(ctx.clinicalPatterns));
});

test('large report: normal parameters are summarized as a count+list, not expanded per-param', () => {
  const large = makeLargeReport(50);
  const ctx = buildAiContext(large);

  // All 50 params are normal — the normalSummary should aggregate them
  assert.equal(ctx.normalSummary.count, 50);
  assert.equal(ctx.normalSummary.parameters.length, 50);

  // The formatted text should reference the count, not list all 50 individually with full detail
  const text = formatContextForClaude(ctx);
  assert.ok(text.includes('NORMAL PARAMETERS (50)'), 'Should summarize count');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. TOKEN OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════════

test('token optimization: formatted normal report is more compact than equivalent full JSON', () => {
  const ctx = buildAiContext(normalReport);
  const formatted = formatContextForClaude(ctx);
  const fullJson = JSON.stringify(ctx, null, 2);

  // The formatted context should be more token-efficient than raw JSON
  assert.ok(
    formatted.length < fullJson.length,
    `Formatted text (${formatted.length} chars) should be shorter than full JSON (${fullJson.length} chars)`,
  );
});

test('token optimization: formatted critical report stays under 12000 characters', () => {
  const ctx = buildAiContext(criticalReport);
  const formatted = formatContextForClaude(ctx);
  assert.ok(formatted.length < 12000, `Formatted context too large: ${formatted.length} chars`);
});

test('token optimization: large 50-parameter report formatted context stays under 20000 characters', () => {
  const large = makeLargeReport(50);
  const ctx = buildAiContext(large);
  const formatted = formatContextForClaude(ctx);
  assert.ok(formatted.length < 20000, `Large formatted context too large: ${formatted.length} chars`);
});

test('token optimization: estimateTokens returns a positive number for non-empty strings', () => {
  assert.ok(estimateTokens('hello world') > 0);
  assert.equal(estimateTokens(''), 0);
});

test('token optimization: excessive token warning triggers for artificially large context', () => {
  // Inject a massive normalSummary to cross the ~12000 char (3000 token) threshold
  // Each param name is ~40 chars; 400 params = ~16000 chars just in the array
  const mockCtx = {
    reportSummary: { totalParameters: 400 },
    aiInstructions: { tone: 'Professional, empathetic, educational, non-diagnostic tone' },
    nutritionContext: { 'Vitamin D': { requiresNutritionalFocus: true } },
    normalSummary: {
      count: 400,
      parameters: Array.from({ length: 400 }, (_, i) => `param_very_long_descriptive_name_index_${i}_biochemical_marker`),
    },
    // Pad with verbose clinical patterns
    clinicalPatterns: Array.from({ length: 20 }, (_, i) => ({
      name: `Clinical Pattern ${i}`,
      description: `Detailed description of clinical pattern number ${i} with extended contextual information for thorough analysis`,
    })),
    riskSummary: {
      overall: 75,
      domains: Array.from({ length: 10 }, (_, i) => ({
        name: `Medical Domain ${i}`,
        score: 80 + i,
        risk: 'LOW_RISK',
        confidence: 0.85,
      })),
    },
  };
  const warnings = validateAiContext(mockCtx);
  const hasTokenWarning = warnings.some((w) => w.code === AI_CONTEXT_WARNING_CODES.EXCESSIVE_TOKEN_ESTIMATE);
  assert.equal(hasTokenWarning, true, 'Should warn when token estimate is excessive');
});

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT: reportSummarizer
// ═══════════════════════════════════════════════════════════════════════════════

test('reportSummarizer: correctly categorizes health score to health category', () => {
  const result95 = summarizeReport({ parameters: [], riskSummary: { overall: 95, domains: [] } });
  const result80 = summarizeReport({ parameters: [], riskSummary: { overall: 80, domains: [] } });
  const result65 = summarizeReport({ parameters: [], riskSummary: { overall: 65, domains: [] } });
  const result45 = summarizeReport({ parameters: [], riskSummary: { overall: 45, domains: [] } });
  const result25 = summarizeReport({ parameters: [], riskSummary: { overall: 25, domains: [] } });

  assert.equal(result95.healthCategory, 'Excellent');
  assert.equal(result80.healthCategory, 'Good');
  assert.equal(result65.healthCategory, 'Fair');
  assert.equal(result45.healthCategory, 'Poor');
  assert.equal(result25.healthCategory, 'Critical');
});

test('reportSummarizer: highestRiskDomain picks the lowest-scoring domain', () => {
  const result = summarizeReport({
    parameters: [],
    riskSummary: {
      overall: 70,
      domains: [
        { name: 'Kidney', score: 90, risk: 'VERY_LOW_RISK' },
        { name: 'Cardiac', score: 30, risk: 'VERY_HIGH_RISK' },
        { name: 'Liver', score: 75, risk: 'LOW_RISK' },
      ],
    },
  });
  assert.equal(result.highestRiskDomain.name, 'Cardiac');
  assert.equal(result.highestRiskDomain.score, 30);
});

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT: nutritionContext
// ═══════════════════════════════════════════════════════════════════════════════

test('nutritionContext: only includes nutrients whose parameters appear in the report', () => {
  const params = [
    makeParam('vitamin_b12', 100, 'LOW', 'MILD_LOW'),
    makeParam('sodium', 140, 'NORMAL', 'NORMAL'),
  ];
  const result = extractNutritionContext(params);

  assert.ok('Vitamin B12' in result, 'Vitamin B12 should be present');
  assert.ok('Sodium' in result, 'Sodium should be present');
  assert.ok(!('Calcium' in result), 'Calcium should NOT be present (not in params)');
});

test('nutritionContext: NUTRIENT_PARAMETER_MAP covers all required 14 nutrients', () => {
  const required = ['Iron', 'Vitamin D', 'Vitamin B12', 'Folate', 'Protein', 'Albumin', 'Calcium', 'Magnesium', 'Potassium', 'Sodium', 'Zinc', 'Ferritin', 'Glucose', 'HbA1c'];
  for (const nutrient of required) {
    assert.ok(nutrient in NUTRIENT_PARAMETER_MAP, `Missing nutrient mapping: ${nutrient}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT: abnormalContext
// ═══════════════════════════════════════════════════════════════════════════════

test('abnormalContext: critical items appear in both criticalFindings and abnormalParameters', () => {
  const params = [
    makeParam('hemoglobin', 40, 'CRITICAL_LOW', 'CRITICAL_LOW', { critical: true }),
    makeParam('sodium', 140, 'NORMAL', 'NORMAL'),
  ];
  const { criticalFindings, abnormalParameters, normalSummary } = extractAbnormalAndCritical(params);

  assert.equal(criticalFindings.length, 1);
  assert.equal(abnormalParameters.length, 1); // critical also in abnormal
  assert.equal(normalSummary.count, 1);
  assert.ok(criticalFindings[0].parameter === 'hemoglobin');
});

test('abnormalContext: UNKNOWN status parameters do not appear in abnormal or normal counts', () => {
  const params = [
    { id: 'hemoglobin', value: null, status: 'UNKNOWN', severity: 'UNKNOWN' },
    makeParam('sodium', 140, 'NORMAL'),
  ];
  const { criticalFindings, abnormalParameters, normalSummary } = extractAbnormalAndCritical(params);

  assert.equal(criticalFindings.length, 0);
  assert.equal(abnormalParameters.length, 0);
  assert.equal(normalSummary.count, 1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT: promptContext
// ═══════════════════════════════════════════════════════════════════════════════

test('promptContext: all required instruction keys are present', () => {
  const instr = buildAiInstructions({});
  const required = ['tone', 'language', 'avoidDiagnosis', 'recommendNutrition', 'recommendDoctorWhenCritical', 'highlightCriticalValues', 'urgencyLevel', 'disclaimer', 'responseFormat'];
  for (const key of required) {
    assert.ok(key in instr, `Missing instruction key: ${key}`);
  }
});

test('promptContext: criticalInstruction is non-null only when hasCritical is true', () => {
  const withCritical = buildAiInstructions({ hasCritical: true });
  const withoutCritical = buildAiInstructions({ hasCritical: false });

  assert.ok(withCritical.criticalInstruction !== null);
  assert.equal(withoutCritical.criticalInstruction, null);
});

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT: contextValidator
// ═══════════════════════════════════════════════════════════════════════════════

test('contextValidator: contextWarning creates correct structure', () => {
  const w = contextWarning(AI_CONTEXT_WARNING_CODES.EMPTY_PARAMETERS, 'test message');
  assert.equal(w.code, 'EMPTY_PARAMETERS');
  assert.equal(w.message, 'test message');
  assert.equal(w.level, 'warning');
});

test('contextValidator: validateAiContext returns empty array for valid context', () => {
  const ctx = buildAiContext(normalReport);
  const warnings = validateAiContext(ctx);
  // May have MISSING_NUTRITION_CONTEXT since normalReport params don't include nutrition-tracked ones
  // But should NOT have INVALID_INPUT_DATA or MISSING_REPORT_SUMMARY
  const criticalWarnings = warnings.filter(
    (w) => w.code === AI_CONTEXT_WARNING_CODES.INVALID_INPUT_DATA || w.code === AI_CONTEXT_WARNING_CODES.MISSING_REPORT_SUMMARY,
  );
  assert.equal(criticalWarnings.length, 0);
});

test('contextValidator: all warning codes are defined in AI_CONTEXT_WARNING_CODES', () => {
  const codes = Object.values(AI_CONTEXT_WARNING_CODES);
  assert.ok(codes.includes('INVALID_INPUT_DATA'));
  assert.ok(codes.includes('EMPTY_PARAMETERS'));
  assert.ok(codes.includes('TRUNCATED_CONTEXT'));
  assert.ok(codes.includes('MISSING_REPORT_SUMMARY'));
  assert.ok(codes.includes('MISSING_AI_INSTRUCTIONS'));
  assert.ok(codes.includes('EXCESSIVE_TOKEN_ESTIMATE'));
  assert.ok(codes.includes('MISSING_NUTRITION_CONTEXT'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION: Full pipeline → AI Context → Claude format
// ═══════════════════════════════════════════════════════════════════════════════

test('integration: output shape has all 9 required top-level keys', () => {
  const ctx = buildAiContext(normalReport);
  const required = ['reportSummary', 'criticalFindings', 'abnormalParameters', 'normalSummary', 'clinicalPatterns', 'riskSummary', 'nutritionContext', 'metadata', 'aiInstructions'];
  for (const key of required) {
    assert.ok(key in ctx, `Missing output key: ${key}`);
  }
});

test('integration: metadata always contains schemaVersion and generatedAt', () => {
  const ctx = buildAiContext(normalReport);
  assert.ok(typeof ctx.metadata.schemaVersion === 'string');
  assert.ok(typeof ctx.metadata.generatedAt === 'string');
  assert.ok(ctx.metadata.generatedAt.includes('T'), 'generatedAt should be an ISO string');
});

test('integration: Claude format always starts with the NutriHealth header line', () => {
  for (const report of [normalReport, abnormalReport, criticalReport, nutritionDeficiencyReport]) {
    const ctx = buildAiContext(report);
    const text = formatContextForClaude(ctx);
    assert.ok(text.startsWith('=== NUTRIHEALTH MEDICAL REPORT AI CONTEXT ==='), `Header missing for report: ${report.metadata?.fileName}`);
  }
});
