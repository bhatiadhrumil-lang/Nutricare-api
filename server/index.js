require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');

const reportRoutes = require('./routes/report.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────
app.use('/api', reportRoutes);
app.use('/api', chatRoutes);

// ─── Health Check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'NutriHealth server is running' });
});

// ─── Multer Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size must not exceed 15 MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid file upload.',
    });
  }
  if (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
  next();
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ NutriHealth server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
