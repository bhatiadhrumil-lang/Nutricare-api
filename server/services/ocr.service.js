/**
 * ocr.service.js
 * Extracts text content from uploaded blood report files.
 *
 * Current support:
 *   - PDF  → pdf-parse (fully working, no API needed)
 *   - Image (PNG/JPG/WebP) → returns file path for Gemini Vision (handled in ai.service.js)
 *
 * To swap OCR later: replace extractTextFromImage() with Tesseract.js
 * or Google Cloud Vision API call — the interface stays the same.
 */

const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

/**
 * Extracts text from a PDF file using pdf-parse.
 * @param {string} filePath - Absolute path to the PDF.
 * @returns {Promise<string>} Extracted plain text.
 */
async function extractTextFromPdf(filePath) {
  // Lazy-load pdf-parse to avoid issues if not installed
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text.trim();
}

/**
 * For images: we return a special sentinel so gemini.service knows
 * to use Gemini's native vision (inlineData) instead of text input.
 * @param {string} filePath
 * @param {string} mimeType
 * @returns {{ isImage: true, filePath: string, mimeType: string }}
 */
async function extractTextFromImage(filePath, mimeType) {
  try {
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(filePath);
    await worker.terminate();
    return data.text.trim();
  } catch (error) {
    console.warn('[OCR] Image OCR failed, falling back to image placeholder:', error.message);
    return { isImage: true, filePath, mimeType };
  }
}

/**
 * Main entry point — routes by file type.
 * @param {string} filePath  - Absolute path to the uploaded file.
 * @param {string} mimeType  - MIME type of the file.
 * @returns {Promise<string | { isImage: true, filePath: string, mimeType: string }>}
 */
async function extractText(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    return extractTextFromPdf(filePath);
  }

  // For all image types, perform OCR locally and use the extracted text when possible.
  if (mimeType.startsWith('image/')) {
    return extractTextFromImage(filePath, mimeType);
  }

  throw new Error(`Unsupported file type for text extraction: ${mimeType}`);
}

module.exports = { extractText };
