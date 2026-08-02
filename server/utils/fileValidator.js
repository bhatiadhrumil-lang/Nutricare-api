/**
 * fileValidator.js
 * Validates uploaded files for allowed types and size.
 * Swap or extend this list to support additional file types.
 */

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

/**
 * Validates a Multer file object.
 * @param {Express.Multer.File} file
 * @returns {{ valid: boolean, error?: string }}
 */
function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file uploaded. Please attach a blood report.' };
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return {
      valid: false,
      error: 'Only PDF, PNG, JPG, and JPEG files are allowed.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size must not exceed 15 MB.',
    };
  }

  return { valid: true };
}

module.exports = { validateFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES };
