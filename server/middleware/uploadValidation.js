const fs = require('fs');
const path = require('path');
const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } = require('../utils/fileValidator');

const ALLOWED_FILE_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

function removeTemporaryFile(file) {
  if (!file?.path) {
    return;
  }

  try {
    fs.unlinkSync(file.path);
  } catch {
    // The upload must still be rejected even when its temporary file is gone.
  }
}

function rejectUpload(req, res, status, message) {
  removeTemporaryFile(req.file);
  return res.status(status).json({
    success: false,
    message,
  });
}

function validateUpload(req, res, next) {
  const file = req.file;

  if (!file) {
    return rejectUpload(req, res, 400, 'A report file is required.');
  }

  const extension = path.extname(file.originalname || '').toLowerCase();

  if (!ALLOWED_FILE_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return rejectUpload(req, res, 400, 'Only PDF, PNG, JPG, JPEG, and WebP files are allowed.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return rejectUpload(req, res, 413, 'File size must not exceed 15 MB.');
  }

  return next();
}

module.exports = { validateUpload };
