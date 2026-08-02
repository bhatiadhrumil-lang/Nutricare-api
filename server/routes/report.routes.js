/**
 * report.routes.js
 * POST /api/analyze-report
 *
 * Uses Multer to accept multipart/form-data with a "report" file field.
 * Files are stored temporarily in /uploads/ and cleaned up after processing.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } = require('../utils/fileValidator');
const { analyzeReportController } = require('../controllers/report.controller');
const { authenticateCognitoToken } = require('../middleware/authMiddleware');
const { validateUpload } = require('../middleware/uploadValidation');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const router = express.Router();

// ── Ensure uploads directory exists ─────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── Multer config ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `report-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `Unsupported file type: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.sub || ipKeyGenerator(req.ip),
  handler: (_req, res) => res.status(429).json({
    success: false,
    message: 'Too many upload requests. Please try again later.',
  }),
});

// ── Route ────────────────────────────────────────────────────
router.post(
  '/analyze-report',
  authenticateCognitoToken,
  uploadRateLimit,
  upload.single('report'),
  validateUpload,
  analyzeReportController,
);

module.exports = router;
