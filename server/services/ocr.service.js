/**
 * ocr.service.js
 * Extracts text content from uploaded blood report files.
 *
 *   - PDF with a text layer → pdf-parse (fast, no OCR needed)
 *   - Scanned / image-only PDF → pages are rendered with pdftoppm and OCR'd
 *   - Image (PNG/JPG/WebP)    → OCR via the native `tesseract` CLI when
 *     available, with tesseract.js as a portable fallback
 *
 * The service NEVER returns a placeholder: when no text can be recovered it
 * throws an Error with a machine-readable `code` (`OCR_FAILED` or
 * `PDF_UNREADABLE`) so the controller can answer 422 instead of running the
 * medical pipeline on an empty string and returning a generic card.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { createWorker } = require('tesseract.js');

// A PDF whose embedded text is shorter than this is treated as scanned
// (headings / metadata only) and sent through the OCR fallback instead.
const MIN_PDF_TEXT_CHARS = 100;
// Upper bound for scanned-PDF OCR so a 50-page document cannot stall an
// upload request. Routine lab reports are 1–3 pages.
const MAX_PDF_OCR_PAGES = 5;
// Render resolution for OCR. 300 DPI is the standard Tesseract sweet spot.
const PDF_RENDER_DPI = 300;

function execFileAsync(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// ─── Capability probes (cached; missing binaries degrade gracefully) ─────────
let nativeTesseractAvailable;
async function hasNativeTesseract() {
  if (nativeTesseractAvailable === undefined) {
    try {
      await execFileAsync('tesseract', ['--version'], { timeout: 10000 });
      nativeTesseractAvailable = true;
    } catch {
      nativeTesseractAvailable = false;
    }
  }
  return nativeTesseractAvailable;
}

let pdftoppmAvailable;
async function hasPdftoppm() {
  if (pdftoppmAvailable === undefined) {
    try {
      await execFileAsync('pdftoppm', ['-h'], { timeout: 10000 });
      pdftoppmAvailable = true;
    } catch (error) {
      // pdftoppm prints usage to stderr and exits non-zero; it is present
      // whenever the binary ran at all (ENOENT means truly missing).
      pdftoppmAvailable = error?.code !== 'ENOENT';
    }
  }
  return pdftoppmAvailable;
}

function ocrFailedError(detail) {
  const error = new Error(
    'We could not read any text from this image. Please upload a clearer, well-lit scan '
    + 'or a PDF with selectable text.',
  );
  error.code = 'OCR_FAILED';
  if (detail) error.detail = detail;
  return error;
}

// ─── Image OCR ───────────────────────────────────────────────────────────────
/**
 * OCR one image file with the native Tesseract CLI (fast, uses system
 * language data — no model download). PSM 6 assumes a uniform block of
 * text, which matches lab report pages and tables.
 */
async function ocrImageWithCli(filePath) {
  const stdout = await execFileAsync(
    'tesseract',
    [filePath, 'stdout', '--psm', '6', '-l', 'eng'],
    { timeout: 90000, maxBuffer: 16 * 1024 * 1024 },
  );
  return (stdout || '').trim();
}

/** Portable fallback when the native CLI is not installed. */
async function ocrImageWithJs(filePath) {
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(filePath);
    return (data?.text || '').trim();
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromImage(filePath) {
  let lastError = null;

  if (await hasNativeTesseract()) {
    try {
      const text = await ocrImageWithCli(filePath);
      if (text) return text;
      lastError = new Error('Native OCR returned no text.');
    } catch (error) {
      lastError = error;
    }
  }

  try {
    const text = await ocrImageWithJs(filePath);
    if (text) return text;
  } catch (error) {
    lastError = lastError || error;
  }

  console.warn('[OCR] Image OCR produced no text:', lastError?.message);
  throw ocrFailedError(lastError?.message);
}

// ─── PDF text + scanned-PDF OCR fallback ─────────────────────────────────────
async function extractTextFromPdf(filePath) {
  let pdfText = '';
  let pageCount = null;

  try {
    // Lazy-load pdf-parse to avoid issues if not installed
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    pdfText = (data?.text || '').trim();
    pageCount = typeof data?.numpages === 'number' ? data.numpages : null;
  } catch (error) {
    console.warn('[OCR] pdf-parse failed, trying scanned-PDF OCR:', error.message);
  }

  if (pdfText.length >= MIN_PDF_TEXT_CHARS) {
    return pdfText;
  }

  // Text layer missing or trivial (scanned PDF) — render pages and OCR them.
  if (!(await hasPdftoppm())) {
    const error = new Error(
      'This PDF appears to be a scanned image with no readable text, and the server cannot convert '
      + 'its pages right now. Please upload a clear photo/scan of the report instead.',
    );
    error.code = 'PDF_UNREADABLE';
    throw error;
  }

  const pagesToRender = pageCount ? Math.min(pageCount, MAX_PDF_OCR_PAGES) : MAX_PDF_OCR_PAGES;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutrihealth-pdf-'));
  try {
    await execFileAsync(
      'pdftoppm',
      ['-r', String(PDF_RENDER_DPI), '-png', '-f', '1', '-l', String(pagesToRender), filePath, path.join(tmpDir, 'page')],
      { timeout: 60000, maxBuffer: 16 * 1024 * 1024 },
    );

    const pageFiles = fs.readdirSync(tmpDir)
      .filter((name) => name.endsWith('.png'))
      .sort()
      .map((name) => path.join(tmpDir, name));

    if (pageFiles.length === 0) {
      const error = new Error(
        'This PDF could not be converted into readable pages. Please upload a clear photo/scan of the report instead.',
      );
      error.code = 'PDF_UNREADABLE';
      throw error;
    }

    const pageTexts = [];
    for (const pageFile of pageFiles) {
      try {
        pageTexts.push(await extractTextFromImage(pageFile));
      } catch (pageError) {
        console.warn(`[OCR] Page OCR failed (${path.basename(pageFile)}):`, pageError.message);
      }
    }

    const combined = pageTexts.filter(Boolean).join('\n\n--- page break ---\n\n').trim();
    if (!combined) {
      const error = new Error(
        'We could not read any text from this scanned PDF. Please upload a clearer scan '
        + 'or a PDF with selectable text.',
      );
      error.code = 'PDF_UNREADABLE';
      throw error;
    }
    if (pageCount && pageCount > MAX_PDF_OCR_PAGES) {
      console.warn(`[OCR] PDF has ${pageCount} pages; only the first ${MAX_PDF_OCR_PAGES} were OCR'd.`);
    }
    return combined;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/**
 * Main entry point — routes by file type. Always resolves to a non-empty
 * string or throws a coded Error (`OCR_FAILED` / `PDF_UNREADABLE`).
 * @param {string} filePath  - Absolute path to the uploaded file.
 * @param {string} mimeType  - MIME type of the file.
 * @returns {Promise<string>}
 */
async function extractText(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    return extractTextFromPdf(filePath);
  }

  if (mimeType.startsWith('image/')) {
    return extractTextFromImage(filePath);
  }

  throw new Error(`Unsupported file type for text extraction: ${mimeType}`);
}

module.exports = { extractText };
