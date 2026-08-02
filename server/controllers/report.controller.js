/**
 * report.controller.js
 * Handles POST /api/analyze-report
 *
 * Flow:
 *   1. Validate uploaded file
 *   2. Extract text (PDF) or delegate to Gemini Vision (image)
 *   3. Send to Gemini for structured analysis
 *   4. Return JSON to frontend
 *   5. Clean up temp file
 */

const fs = require('fs');
const path = require('path');
const { validateFile } = require('../utils/fileValidator');
const { extractText } = require('../services/ocr.service');
const { analyzeReport } = require('../services/ai.service');

async function processMedicalReport(rawText, file) {
  const { default: medicalPipeline } = await import('../medical/pipeline/medicalPipeline.js');
  return medicalPipeline.process({
    rawText,
    sourceType: file.mimetype,
    fileName: file.originalname,
    pageCount: null,
  });
}

/**
 * POST /api/analyze-report
 */
async function analyzeReportController(req, res) {
  const file = req.file;

  // ── 1. Validate ─────────────────────────────────────────
  const validation = validateFile(file);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const filePath = file.path;

  try {
    // ── 2. Extract text / image reference ────────────────
    console.log(`[Report] Processing: ${file.originalname} (${file.mimetype})`);
    const extractionResult = await extractText(filePath, file.mimetype);

    // ── 3. Build the structured medical report ───────────
    const structuredReport = await processMedicalReport(
      typeof extractionResult === 'string' ? extractionResult : '',
      file,
    );

    // ── 4. Analyze with Gemini ───────────────────────────
    console.log('[Report] Sending to Gemini...');
    // Keep the existing image fallback for uploads where local OCR is unavailable.
    // Text OCR is sent as the structured pipeline result, never as raw OCR text.
    const analysis = await analyzeReport(
      typeof extractionResult === 'string' ? JSON.stringify(structuredReport) : extractionResult,
    );
    console.log('[Report] Analysis complete. Disease detected:', analysis.disease);

    // ── 5. Respond ───────────────────────────────────────
    return res.status(200).json(analysis);

  } catch (err) {
    console.error('[Report Controller Error]', err.message);

    // Distinguish Gemini API errors from internal errors
    if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
      return res.status(500).json({
        error: 'Gemini API key is invalid or missing. Please check your server/.env file.',
      });
    }

    return res.status(500).json({
      error: err.message || 'Failed to analyze the report. Please try again.',
    });

  } finally {
    // ── 6. Always clean up temp file ─────────────────────
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = { analyzeReportController };
