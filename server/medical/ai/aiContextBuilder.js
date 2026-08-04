import { summarizeReport } from './reportSummarizer.js';
import { extractNutritionContext } from './nutritionContext.js';
import { extractAbnormalAndCritical } from './abnormalContext.js';
import { buildAiInstructions } from './promptContext.js';
import { AI_CONTEXT_WARNING_CODES, contextWarning } from './contextValidator.js';

/**
 * Transforms a complete normalized medical pipeline report into a compact,
 * structured, AI-optimized context. This context is the ONLY input provided to Claude.
 */
export function buildAiContext(pipelineData = {}) {
  const warnings = [];

  if (!pipelineData || typeof pipelineData !== 'object') {
    warnings.push(contextWarning(AI_CONTEXT_WARNING_CODES.INVALID_INPUT_DATA, 'Invalid or null pipeline data provided.'));
    pipelineData = {};
  }

  const parameters = pipelineData.parameters ?? [];
  if (!Array.isArray(parameters) || parameters.length === 0) {
    warnings.push(contextWarning(AI_CONTEXT_WARNING_CODES.EMPTY_PARAMETERS, 'No parameter data available in report context.'));
  }

  const { criticalFindings, abnormalParameters, normalSummary } = extractAbnormalAndCritical(parameters);
  const nutritionCtx = extractNutritionContext(parameters);

  const clinicalPatterns = pipelineData.consistency?.patterns ?? pipelineData.consistencyPatterns ?? [];
  const riskSummary = pipelineData.healthScore ?? pipelineData.riskSummary ?? { overall: 100, domains: [] };

  const reportSummary = summarizeReport({
    parameters,
    criticalFindings,
    abnormalParameters,
    riskSummary,
  });

  const metadata = {
    version: pipelineData.version ?? '1.0.0',
    sourceType: pipelineData.metadata?.sourceType ?? null,
    generatedAt: new Date().toISOString(),
    warnings,
  };

  const aiInstructions = buildAiInstructions({
    hasCritical: criticalFindings.length > 0,
    hasAbnormal: abnormalParameters.length > 0,
  });

  return {
    reportSummary,
    criticalFindings,
    abnormalParameters,
    normalSummary,
    clinicalPatterns,
    riskSummary,
    nutritionContext: nutritionCtx,
    metadata,
    aiInstructions,
  };
}

/**
 * Converts a structured AI Context object into a clean, token-efficient text format
 * optimized for Claude (AWS Bedrock).
 */
export function formatContextForClaude(aiContext = {}) {
  const {
    reportSummary = {},
    criticalFindings = [],
    abnormalParameters = [],
    normalSummary = {},
    clinicalPatterns = [],
    riskSummary = {},
    nutritionContext = {},
    aiInstructions = {},
  } = aiContext;

  const sections = [];

  sections.push(`=== MEDICAL REPORT AI CONTEXT ===`);
  sections.push(`Overall Health Score: ${reportSummary.overallHealthScore ?? 'N/A'}/100`);
  sections.push(`Clinical Overview: ${reportSummary.clinicalStatusOverview ?? 'Optimal'}`);
  sections.push(`Total Parameters Evaluated: ${reportSummary.totalParameters ?? 0}`);

  if (criticalFindings.length > 0) {
    sections.push(`\n=== CRITICAL FINDINGS (${criticalFindings.length}) ===`);
    for (const item of criticalFindings) {
      sections.push(`- CRITICAL: ${item.parameter} = ${item.value} (Status: ${item.status}, Severity: ${item.severity}) -> Action: ${item.recommendedAction}`);
    }
  }

  if (abnormalParameters.length > 0) {
    sections.push(`\n=== ABNORMAL PARAMETERS (${abnormalParameters.length}) ===`);
    for (const item of abnormalParameters) {
      sections.push(`- ${item.parameter} = ${item.value} (Status: ${item.status}, Severity: ${item.severity})`);
    }
  }

  if (normalSummary.count > 0) {
    sections.push(`\n=== NORMAL PARAMETER SUMMARY ===`);
    sections.push(`${normalSummary.count} parameters within normal reference ranges: ${normalSummary.parameters.join(', ')}`);
  }

  if (Array.isArray(clinicalPatterns) && clinicalPatterns.length > 0) {
    sections.push(`\n=== CLINICAL CONSISTENCY FINDINGS ===`);
    for (const pattern of clinicalPatterns) {
      sections.push(`- Pattern: ${pattern.name || pattern.id}: ${pattern.description}`);
    }
  }

  if (riskSummary.domains && riskSummary.domains.length > 0) {
    sections.push(`\n=== MEDICAL RISK SUMMARY ===`);
    for (const d of riskSummary.domains) {
      sections.push(`- ${d.name}: Score ${d.score}/100 (Risk: ${d.risk}, Confidence: ${d.confidence})`);
    }
  }

  if (Object.keys(nutritionContext).length > 0) {
    sections.push(`\n=== NUTRITION-RELEVANT FINDINGS ===`);
    for (const [nut, data] of Object.entries(nutritionContext)) {
      if (data.requiresNutritionalFocus) {
        const paramStr = data.relevantParameters.map((p) => `${p.parameter} (${p.status})`).join(', ');
        sections.push(`- ${nut}: Requires nutritional focus due to ${paramStr}`);
      }
    }
  }

  sections.push(`\n=== AI INSTRUCTIONS ===`);
  sections.push(`Tone: ${aiInstructions.tone}`);
  sections.push(`Language: ${aiInstructions.language}`);
  sections.push(`Do NOT diagnose diseases. Focus on explanation, nutrition, and lifestyle recommendations.`);
  if (aiInstructions.recommendDoctorWhenCritical) {
    sections.push(`URGENT: Recommend immediate physician evaluation for critical findings.`);
  }

  return sections.join('\n');
}

export default { buildAiContext, formatContextForClaude };
