/**
 * aiContextBuilder.js
 * Transforms the complete normalized medical pipeline output into a compact,
 * structured, AI-optimized context object.
 *
 * This context is the ONLY medical data provided to Claude (AWS Bedrock).
 * Raw OCR text is NEVER sent to the AI.
 *
 * Pipeline integration:
 *   Extraction → Formatter → Normalization → Status → Severity →
 *   Critical Detection → Consistency → Risk Scoring → AI Context Builder → AI Service → Claude
 */

import { summarizeReport } from './reportSummarizer.js';
import { extractNutritionContext } from './nutritionContext.js';
import { extractAbnormalAndCritical } from './abnormalContext.js';
import { buildAiInstructions } from './promptContext.js';
import {
  AI_CONTEXT_WARNING_CODES,
  contextWarning,
  validateAiContext,
} from './contextValidator.js';

/** Semantic version of the AI context schema for downstream compatibility checks. */
const AI_CONTEXT_VERSION = '2.0.0';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Safely extracts the consistency data object from the pipeline result.
 * Accepts both { consistency: { patterns, contradictions, score } } and flat shapes.
 */
function resolveConsistencyData(pipelineData) {
  const nested = pipelineData.consistency;
  if (nested && typeof nested === 'object') {
    return {
      score: nested.score ?? null,
      patterns: Array.isArray(nested.patterns) ? nested.patterns : [],
      contradictions: Array.isArray(nested.contradictions) ? nested.contradictions : [],
      warnings: Array.isArray(nested.warnings) ? nested.warnings : [],
    };
  }
  return {
    score: null,
    patterns: Array.isArray(pipelineData.consistencyPatterns) ? pipelineData.consistencyPatterns : [],
    contradictions: [],
    warnings: [],
  };
}

/**
 * Safely extracts the health risk/score object from the pipeline result.
 * Accepts both { healthScore: { overall, domains } } and flat { overall, domains } shapes.
 */
function resolveRiskSummary(pipelineData) {
  const hs = pipelineData.healthScore;
  if (hs && typeof hs === 'object') {
    return {
      overall: typeof hs.overall === 'number' ? hs.overall : 100,
      domains: Array.isArray(hs.domains) ? hs.domains : [],
    };
  }

  const flat = pipelineData.riskSummary;
  if (flat && typeof flat === 'object') {
    return {
      overall: typeof flat.overall === 'number' ? flat.overall : 100,
      domains: Array.isArray(flat.domains) ? flat.domains : [],
    };
  }

  return { overall: 100, domains: [] };
}

/**
 * Safely extracts source metadata from the pipeline result.
 */
function resolveMetadata(pipelineData) {
  const m = pipelineData.metadata ?? {};
  return {
    sourceType: m.sourceType ?? null,
    fileName: m.fileName ?? null,
    pageCount: m.pageCount ?? null,
  };
}

// ─── Primary export ───────────────────────────────────────────────────────────

/**
 * Builds the complete AI context object from the full pipeline output.
 *
 * @param {object} pipelineData - The combined output of all preceding pipeline stages.
 *   Expected fields (all optional — graceful degradation if missing):
 *     - parameters:   Array of enriched parameter objects (status, severity, critical flags, etc.)
 *     - healthScore:  { overall: number, domains: Array } — from Risk Scoring Engine
 *     - consistency:  { score, patterns, contradictions, warnings } — from Consistency Engine
 *     - metadata:     { sourceType, fileName, pageCount } — from pipeline
 *     - version:      string
 *
 * @returns {object} Structured AI context:
 *   { reportSummary, criticalFindings, abnormalParameters, normalSummary,
 *     clinicalPatterns, riskSummary, nutritionContext, metadata, aiInstructions }
 */
export function buildAiContext(pipelineData = {}) {
  const buildWarnings = [];

  // ── Guard: invalid input ──────────────────────────────────────────────────
  if (!pipelineData || typeof pipelineData !== 'object') {
    buildWarnings.push(contextWarning(AI_CONTEXT_WARNING_CODES.INVALID_INPUT_DATA, 'Invalid or null pipeline data provided to AI Context Builder.'));
    pipelineData = {};
  }

  // ── Resolve parameters ────────────────────────────────────────────────────
  const parameters = Array.isArray(pipelineData.parameters) ? pipelineData.parameters : [];
  if (parameters.length === 0) {
    buildWarnings.push(contextWarning(AI_CONTEXT_WARNING_CODES.EMPTY_PARAMETERS, 'No parameter data available — AI context will be sparse.'));
  }

  // ── Resolve supporting output from each engine ────────────────────────────
  const consistencyData = resolveConsistencyData(pipelineData);
  const riskSummary = resolveRiskSummary(pipelineData);
  const sourceMetadata = resolveMetadata(pipelineData);

  // ── Section 3 & 4: Abnormal + Critical ───────────────────────────────────
  const { criticalFindings, abnormalParameters, normalSummary } = extractAbnormalAndCritical(parameters);

  // ── Section 7: Nutrition-Relevant Findings ────────────────────────────────
  const nutritionCtx = extractNutritionContext(parameters);
  const hasNutritionFocus = Object.values(nutritionCtx).some((n) => n.requiresNutritionalFocus);

  // ── Section 1: Report Summary ─────────────────────────────────────────────
  const reportSummary = summarizeReport({
    parameters,
    criticalFindings,
    abnormalParameters,
    riskSummary,
    consistencyData,
  });

  // ── Section 5: Clinical Patterns (from Consistency Engine) ───────────────
  // Include both patterns and contradictions for complete clinical picture
  const clinicalPatterns = [
    ...consistencyData.patterns,
    ...(consistencyData.contradictions.length > 0
      ? consistencyData.contradictions.map((c) => ({ ...c, type: 'contradiction' }))
      : []),
  ];

  // ── Section 6: Medical Risk Summary ──────────────────────────────────────
  // Reference riskSummary directly (already resolved, no duplication)

  // ── Section 8: Metadata ───────────────────────────────────────────────────
  const metadata = {
    schemaVersion: AI_CONTEXT_VERSION,
    pipelineVersion: pipelineData.version ?? null,
    sourceType: sourceMetadata.sourceType,
    fileName: sourceMetadata.fileName ?? null,
    pageCount: sourceMetadata.pageCount ?? null,
    generatedAt: new Date().toISOString(),
    buildWarnings,
  };

  // ── Section 9: AI Behavior Instructions ──────────────────────────────────
  const aiInstructions = buildAiInstructions({
    hasCritical: criticalFindings.length > 0,
    hasAbnormal: abnormalParameters.length > 0,
    hasNutritionFocus,
  });

  // ── Assemble context ──────────────────────────────────────────────────────
  const aiContext = {
    reportSummary,           // Section 1 + 2 (critical count embedded)
    criticalFindings,        // Section 2
    abnormalParameters,      // Section 3
    normalSummary,           // Section 4 (summarized, not per-param)
    clinicalPatterns,        // Section 5
    riskSummary,             // Section 6
    nutritionContext: nutritionCtx, // Section 7
    metadata,                // Section 8
    aiInstructions,          // Section 9
  };

  // ── Post-assembly validation ──────────────────────────────────────────────
  const validationWarnings = validateAiContext(aiContext);
  if (validationWarnings.length > 0) {
    metadata.buildWarnings.push(...validationWarnings);
  }

  return aiContext;
}

// ─── Claude formatting ────────────────────────────────────────────────────────

/**
 * Converts the AI context object into a clean, token-efficient text block
 * optimized for Claude (AWS Bedrock). This is the ONLY medical input Claude receives.
 *
 * Structure:
 *   - Report summary header
 *   - Critical findings (if any) — always first after summary
 *   - Abnormal parameters
 *   - Normal parameter summary (compact)
 *   - Clinical patterns & contradictions
 *   - Risk domain summary
 *   - Nutrition-relevant findings (only those requiring focus)
 *   - AI behavior instructions
 *
 * @param {object} aiContext - Output of buildAiContext()
 * @returns {string} Formatted context string for Claude
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
    metadata = {},
  } = aiContext;

  const lines = [];

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push('=== NUTRIHEALTH MEDICAL REPORT AI CONTEXT ===');
  lines.push(`Health Score: ${reportSummary.overallHealthScore ?? 'N/A'}/100 (${reportSummary.healthCategory ?? 'N/A'})`);
  lines.push(`Status: ${reportSummary.clinicalStatusOverview ?? 'Unknown'}`);
  lines.push(`Parameters Evaluated: ${reportSummary.totalParameters ?? 0} total | ${reportSummary.criticalCount ?? 0} critical | ${reportSummary.abnormalCount ?? 0} abnormal | ${reportSummary.normalCount ?? 0} normal`);

  if (reportSummary.highestRiskDomain) {
    const d = reportSummary.highestRiskDomain;
    lines.push(`Highest Risk Domain: ${d.name} (Score: ${d.score}/100, Risk: ${d.risk})`);
  }

  // ── Critical Findings ─────────────────────────────────────────────────────
  if (criticalFindings.length > 0) {
    lines.push(`\n=== ⚠ CRITICAL FINDINGS (${criticalFindings.length}) — IMMEDIATE ATTENTION REQUIRED ===`);
    for (const item of criticalFindings) {
      const emergencyFlag = item.emergency ? ' [LIFE-THREATENING]' : ' [CRITICAL]';
      lines.push(`${emergencyFlag} ${item.parameter}: ${item.value} | Status: ${item.status} | Severity: ${item.severity} | Action: ${item.recommendedAction}`);
    }
  }

  // ── Abnormal Parameters ───────────────────────────────────────────────────
  const abnormNonCritical = abnormalParameters.filter(
    (p) => !criticalFindings.some((c) => c.parameter === p.parameter),
  );
  if (abnormNonCritical.length > 0) {
    lines.push(`\n=== ABNORMAL PARAMETERS (${abnormNonCritical.length}) ===`);
    for (const item of abnormNonCritical) {
      const dir = item.direction ? ` [${item.direction}]` : '';
      lines.push(`- ${item.parameter}: ${item.value}${dir} | Severity: ${item.severity}`);
    }
  }

  // ── Normal Summary ────────────────────────────────────────────────────────
  if (normalSummary.count > 0) {
    lines.push(`\n=== NORMAL PARAMETERS (${normalSummary.count}) ===`);
    lines.push(`Within reference ranges: ${normalSummary.parameters.join(', ')}`);
  }

  // ── Clinical Consistency ──────────────────────────────────────────────────
  const patterns = clinicalPatterns.filter((p) => p.type !== 'contradiction');
  const contradictions = clinicalPatterns.filter((p) => p.type === 'contradiction');

  if (patterns.length > 0) {
    lines.push(`\n=== CLINICAL CONSISTENCY PATTERNS (${patterns.length}) ===`);
    for (const p of patterns) {
      lines.push(`- ${p.name ?? p.id ?? 'Pattern'}: ${p.description ?? ''}`);
    }
  }

  if (contradictions.length > 0) {
    lines.push(`\n=== CLINICAL CONTRADICTIONS (${contradictions.length}) ===`);
    for (const c of contradictions) {
      lines.push(`- ${c.description ?? c.name ?? 'Contradiction'} [Severity: ${c.severity ?? 'N/A'}]`);
    }
  }

  // ── Risk Domain Summary ───────────────────────────────────────────────────
  const domains = Array.isArray(riskSummary.domains) ? riskSummary.domains : [];
  if (domains.length > 0) {
    lines.push(`\n=== MEDICAL RISK DOMAINS (${domains.length}) ===`);
    for (const d of domains) {
      lines.push(`- ${d.name}: Score ${d.score}/100 | Risk: ${d.risk} | Confidence: ${d.confidence}`);
    }
  }

  // ── Nutrition Context ─────────────────────────────────────────────────────
  const nutritionFocusItems = Object.entries(nutritionContext).filter(([, data]) => data.requiresNutritionalFocus);
  const nutritionNormalItems = Object.entries(nutritionContext).filter(([, data]) => !data.requiresNutritionalFocus && data.overallStatus === 'ADEQUATE');

  if (nutritionFocusItems.length > 0 || nutritionNormalItems.length > 0) {
    lines.push(`\n=== NUTRITION-RELEVANT FINDINGS ===`);

    for (const [nutrient, data] of nutritionFocusItems) {
      const paramSummary = data.relevantParameters.map((p) => `${p.parameter}: ${p.value} (${p.nutritionalRelevance})`).join(', ');
      lines.push(`- ${nutrient} [${data.overallStatus}]: ${paramSummary}`);
      if (data.dietaryImplication) {
        lines.push(`  → ${data.dietaryImplication}`);
      }
    }

    if (nutritionNormalItems.length > 0) {
      const adequateNames = nutritionNormalItems.map(([n]) => n).join(', ');
      lines.push(`- ADEQUATE: ${adequateNames}`);
    }
  }

  // ── AI Instructions ───────────────────────────────────────────────────────
  lines.push(`\n=== AI BEHAVIOR INSTRUCTIONS ===`);
  lines.push(`Tone: ${aiInstructions.tone ?? 'Professional, empathetic'}`);
  lines.push(`Language: ${aiInstructions.language ?? 'Clear, layperson-friendly'}`);
  lines.push(`Urgency Level: ${aiInstructions.urgencyLevel ?? 'NORMAL'}`);
  lines.push(`Format: ${aiInstructions.responseFormat ?? 'Structured sections'}`);
  lines.push(`DO NOT diagnose diseases or prescribe medications.`);
  lines.push(`DO recommend nutritional and lifestyle improvements based on findings.`);
  lines.push(`ALWAYS include the disclaimer: "${aiInstructions.disclaimer ?? 'This is not medical advice. Consult a healthcare professional.'}"`);

  if (aiInstructions.criticalInstruction) {
    lines.push(`CRITICAL DIRECTIVE: ${aiInstructions.criticalInstruction}`);
  }

  // ── Metadata footer ───────────────────────────────────────────────────────
  if (metadata.fileName) {
    lines.push(`\n[Report: ${metadata.fileName} | Generated: ${metadata.generatedAt ?? 'N/A'}]`);
  }

  return lines.join('\n');
}

export default { buildAiContext, formatContextForClaude };
