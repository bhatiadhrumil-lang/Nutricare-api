/**
 * report.controller.js
 * Handles POST /api/analyze-report
 *
 * Flow:
 *   1. Validate uploaded file
 *   2. Extract text (PDF) or delegate to OCR (image)
 *   3. Run the full medical pipeline (Extraction → Normalization → Status → Severity → Critical → Consistency → Risk)
 *   4. Build the AI Context (compact, structured, token-efficient)
 *   5. Send AI Context to Claude (AWS Bedrock) via ai.service — NOT raw OCR
 *   6. Return JSON to frontend
 *   7. Clean up temp file
 */

const fs = require('fs');
const path = require('path');
const { validateFile } = require('../utils/fileValidator');
const { extractText } = require('../services/ocr.service');
const { analyzeReport } = require('../services/ai.service');

/**
 * Runs the full medical pipeline on raw OCR text.
 * Returns a pipelineResult with parameters, metadata, and statistics.
 */
async function runMedicalPipeline(rawText, file) {
  const { default: medicalPipeline } = await import('../medical/pipeline/medicalPipeline.js');
  return medicalPipeline.process({
    rawText,
    sourceType: file.mimetype,
    fileName: file.originalname,
    pageCount: null,
  });
}

/**
 * Enriches the basic pipeline result by running all downstream engines:
 *   Severity → Critical Detection → Consistency → Risk Scoring
 * Returns a combined data object ready for the AI Context Builder.
 */
async function enrichPipelineResult(pipelineResult) {
  const { classifySeverity } = await import('../medical/severity/severityEngine.js');
  const { detectCriticalValues } = await import('../medical/critical/criticalEngine.js');
  const { evaluateConsistency } = await import('../medical/consistency/consistencyEngine.js');
  const { calculateHealthRisk } = await import('../medical/risk/riskEngine.js');

  // Apply Severity + Critical Detection to each parameter
  const enrichedParameters = pipelineResult.parameters.map((param) => {
    const severity = classifySeverity({
      id: param.id ?? param.parameter,
      value: param.normalizedValue ?? param.value,
      status: param.status,
      reference: param.referenceRange,
    });

    const critical = detectCriticalValues({
      parameter: param.id ?? param.parameter,
      id: param.id ?? param.parameter,
      value: param.normalizedValue ?? param.value,
      status: severity.status ?? param.status,
      severity: severity.severity ?? 'NORMAL',
    });

    return {
      ...param,
      severity: severity.severity ?? 'NORMAL',
      severityScore: severity.severityScore ?? null,
      clinicalPriority: critical.clinicalPriority ?? severity.clinicalPriority ?? 'LOW',
      critical: critical.critical ?? false,
      emergency: critical.emergency ?? false,
      alertLevel: critical.alertLevel ?? 'ROUTINE',
      recommendedAction: critical.recommendedAction ?? null,
      aiPriority: critical.aiPriority ?? 'LOW',
    };
  });

  // Consistency Engine
  const { consistency } = evaluateConsistency(enrichedParameters);

  // Risk Scoring Engine
  const { healthScore } = calculateHealthRisk(enrichedParameters);

  return {
    parameters: enrichedParameters,
    consistency,
    healthScore,
    metadata: pipelineResult.metadata,
    statistics: pipelineResult.statistics,
    version: '2.0.0',
  };
}

/**
 * POST /api/analyze-report
 */
async function analyzeReportController(req, res) {
  const file = req.file;

  // ── 1. Validate ────────────────────────────────────────────────────────────
  const validation = validateFile(file);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const filePath = file.path;

  try {
    // ── 2. Extract text / image reference ─────────────────────────────────
    console.log(`[Report] Processing: ${file.originalname} (${file.mimetype})`);
    const extractionResult = await extractText(filePath, file.mimetype);

    // ── 3. Run full medical pipeline ──────────────────────────────────────
    const pipelineResult = await runMedicalPipeline(
      typeof extractionResult === 'string' ? extractionResult : '',
      file,
    );

    // ── 4. Enrich with Severity, Critical, Consistency, Risk ─────────────
    let enrichedData;
    try {
      enrichedData = await enrichPipelineResult(pipelineResult);
    } catch (enrichErr) {
      console.warn('[Report] Enrichment failed, using base pipeline result:', enrichErr.message);
      enrichedData = {
        parameters: pipelineResult.parameters,
        consistency: { score: null, patterns: [], contradictions: [], warnings: [] },
        healthScore: { overall: 100, domains: [] },
        metadata: pipelineResult.metadata,
        statistics: pipelineResult.statistics,
        version: '1.0.0',
      };
    }

    // ── 5. Build the AI Context (replaces raw OCR / raw pipeline JSON) ───
    const { buildAiContext, formatContextForClaude } = await import('../medical/ai/aiContextBuilder.js');
    const aiContext = buildAiContext(enrichedData);
    const formattedContext = formatContextForClaude(aiContext);

    console.log(`[Report] AI context built — ${aiContext.criticalFindings.length} critical, ${aiContext.abnormalParameters.length} abnormal.`);

    // ── 6. Analyze with Claude via AI Service ─────────────────────────────
    console.log('[Report] Sending AI context to Claude...');
    // For image-only uploads (no OCR), fall back to image path reference
    const analysis = await analyzeReport(
      typeof extractionResult === 'string' ? formattedContext : extractionResult,
      aiContext,
    );
    console.log('[Report] Analysis complete. Disease detected:', analysis.disease);

    // ── 7. Respond ────────────────────────────────────────────────────────
    return res.status(200).json(analysis);

  } catch (err) {
    console.error('[Report Controller Error]', err.message);

    if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
      return res.status(500).json({
        error: 'Bedrock API key is invalid or missing. Please check your server/.env file.',
      });
    }

    return res.status(500).json({
      error: err.message || 'Failed to analyze the report. Please try again.',
    });

  } finally {
    // ── 8. Always clean up temp file ──────────────────────────────────────
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = { analyzeReportController };
