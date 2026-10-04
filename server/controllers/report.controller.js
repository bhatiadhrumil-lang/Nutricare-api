/**
 * report.controller.js
 * Handles POST /api/analyze-report
 *
 * Flow:
 *   1. Validate uploaded file
 *   2. Extract text (PDF text layer, scanned-PDF OCR fallback, or image OCR)
 *   3. Run the full medical pipeline (Extraction → Normalization → Status → Severity → Critical → Consistency → Risk)
 *   4. Build the AI Context (compact, structured, token-efficient)
 *   5. Send AI Context to Claude (AWS Bedrock) via ai.service — NOT raw OCR
 *   6. Return JSON to frontend (422 when nothing readable/extractable —
 *      never a generic success card for a failed extraction)
 *   7. Clean up temp file
 */

const fs = require('fs');
const path = require('path');
const { validateFile } = require('../utils/fileValidator');
const { extractText } = require('../services/ocr.service');
const { analyzeReport } = require('../services/ai.service');
const dbService = require('../services/db.service');

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
 * Enriches the basic pipeline result by running the full evaluation chain:
 *   Unit Normalization → Reference Normalization → Status → Severity →
 *   Critical Detection → Consistency → Risk Scoring
 * The pipeline's extraction stage emits raw records (parameterId, value,
 * unit, string reference); this stage converts values into canonical units
 * and computes typed statuses so the downstream engines receive the shape
 * they are designed for.
 */
async function enrichPipelineResult(pipelineResult) {
  const { classifySeverity } = await import('../medical/severity/severityEngine.js');
  const { detectCriticalValues } = await import('../medical/critical/criticalEngine.js');
  const { evaluateConsistency } = await import('../medical/consistency/consistencyEngine.js');
  const { calculateHealthRisk } = await import('../medical/risk/riskEngine.js');
  const { normalizeUnit } = await import('../medical/normalization/unitAliasEngine.js');
  const { CANONICAL_UNITS } = await import('../medical/normalization/canonicalUnits.js');
  const { normalizeReference } = await import('../medical/referenceNormalization/referenceNormalizer.js');
  const { calculateMedicalStatus } = await import('../medical/status/statusCalculator.js');

  // 1. Canonicalize: resolve the canonical parameter ID and convert the value
  //    into canonical units (e.g. g/dL -> g/L) when the catalog knows a factor.
  //    Status/severity continue to use the report-unit value together with the
  //    report-unit reference range (unit-consistent), while critical/emergency
  //    thresholds — expressed in canonical units — receive the converted value.
  const canonicalizedParameters = pipelineResult.parameters.map((param) => {
    const id = param.parameterId ?? param.id ?? param.parameter;
    const unitInfo = normalizeUnit(param.unitRaw ?? param.unit ?? '');
    const entry = id ? CANONICAL_UNITS[id] : null;
    const factor = entry ? entry.conversionFactors?.[unitInfo.normalizedUnit] : undefined;
    const isNumeric = typeof param.value === 'number' && Number.isFinite(param.value);
    const canonicalValue = isNumeric && typeof factor === 'number'
      ? Number((param.value * factor).toPrecision(10))
      : param.value;

    return {
      ...param,
      id,
      parameterId: id,
      normalizedValue: canonicalValue,
      normalizedUnit: unitInfo.normalizedUnit || param.unit || null,
      unitWarnings: unitInfo.warnings ?? [],
    };
  });

  // 2. Status → Severity → Critical for every parameter.
  const enrichedParameters = canonicalizedParameters.map((param) => {
    const reference = normalizeReference(param.referenceRange?.raw ?? null);
    const status = calculateMedicalStatus({
      parameter: param.id,
      normalizedValue: param.value,
      reference,
    });

    const severity = classifySeverity({
      id: param.id,
      value: param.value,
      status: status.status,
      reference,
    });

    const critical = detectCriticalValues({
      parameter: param.id,
      id: param.id,
      value: param.normalizedValue,
      status: severity.status ?? status.status,
      severity: severity.severity ?? 'NORMAL',
    });

    return {
      ...param,
      status: status.status,
      referenceNormalized: reference,
      statusWarnings: status.warnings ?? [],
      severity: severity.severity ?? 'UNKNOWN',
      severityScore: severity.severityScore ?? null,
      severityWarnings: severity.warnings ?? [],
      clinicalPriority: critical.clinicalPriority ?? severity.clinicalPriority ?? 'LOW',
      critical: critical.critical ?? false,
      emergency: critical.emergency ?? false,
      alertLevel: critical.alertLevel ?? 'ROUTINE',
      recommendedAction: critical.recommendedAction ?? null,
      aiPriority: critical.aiPriority ?? 'LOW',
      criticalWarnings: critical.warnings ?? [],
    };
  });

  // 3. Consistency Engine
  const { consistency } = evaluateConsistency(enrichedParameters);

  // 4. Risk Scoring Engine
  const { healthScore } = calculateHealthRisk(enrichedParameters);

  return {
    parameters: enrichedParameters,
    consistency,
    healthScore,
    metadata: pipelineResult.metadata,
    statistics: pipelineResult.statistics,
    version: '2.1.0',
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
    // ── 2. Extract text ───────────────────────────────────────────────────
    // extractText() always resolves to a non-empty string or throws a coded
    // Error (OCR_FAILED / PDF_UNREADABLE). There is no image-placeholder
    // path: the pipeline never runs on an empty string.
    console.log(`[Report] Processing: ${file.originalname} (${file.mimetype})`);
    let rawText;
    try {
      rawText = await extractText(filePath, file.mimetype);
    } catch (extractErr) {
      if (extractErr.code === 'OCR_FAILED' || extractErr.code === 'PDF_UNREADABLE') {
        return res.status(422).json({
          success: false,
          code: extractErr.code,
          error: extractErr.message,
        });
      }
      throw extractErr;
    }

    if (!rawText || !rawText.trim()) {
      return res.status(422).json({
        success: false,
        code: 'EMPTY_TEXT',
        error: 'We could not read any text from this file. Please upload a clearer scan or a PDF with selectable text.',
      });
    }

    // ── 3. Run full medical pipeline ──────────────────────────────────────
    const pipelineResult = await runMedicalPipeline(rawText, file);

    if (!pipelineResult.parameters || pipelineResult.parameters.length === 0) {
      return res.status(422).json({
        success: false,
        code: 'NO_PARAMETERS_DETECTED',
        error: 'We could read the file, but found no recognizable blood test values. Please upload a clearer scan showing the test names, values and units — photos should be well-lit, flat and in focus.',
        details: pipelineResult.metadata?.errors ?? [],
      });
    }

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
    const analysis = await analyzeReport(
      formattedContext,
      // Keep the full normalized parameters available for the deterministic
      // fallback. The AI receives only formattedContext; this extra data is
      // never sent to Bedrock.
      { ...aiContext, parameters: enrichedData.parameters },
    );
    console.log('[Report] Analysis complete. Disease detected:', analysis.disease);

    if (req.user?.sub) {
      try {
        await dbService.addReportRecord(req.user.sub, {
          fileName: file.originalname,
          uploadedAt: new Date().toISOString(),
          status: 'Completed',
          disease: analysis.disease,
          healthScore: enrichedData.healthScore?.overall,
        });
      } catch (recErr) {
        console.warn('[Report] Failed to record report history:', recErr.message);
      }
    }

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
