require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');

const reportRoutes = require('./routes/report.routes');
const chatRoutes = require('./routes/chat.routes');
const accountRoutes = require('./routes/account.routes');
const dbService = require('./services/db.service');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Process-level resilience ─────────────────────────────
// Keep the server alive through rogue async errors so an in-flight request
// can never take the whole API down mid-upload (which surfaced as 502 /
// connection-refused in the browser). Request-level errors are still handled
// by the route handlers and the central error middleware below.
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason instanceof Error ? reason.stack || reason.message : reason);
});
process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error.stack || error.message || error);
});

// ─── Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────
app.use('/api', reportRoutes);
app.use('/api', chatRoutes);
app.use('/api', accountRoutes);
app.use('/api', require('./routes/agent.routes'));

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
async function start() {
  // Ensure the database layer (Postgres schema / JSON seed) is ready before
  // we accept traffic. Failures here are logged but do not crash the process —
  // the JSON fallback keeps the API alive if the DB is unreachable.
  try {
    const info = await dbService.initializeDatabase();
    console.log(`[DB Service] Using ${info.mode} store.`);
  } catch (err) {
    console.error('[DB Service] Initialization error:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n✅ NutriHealth server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start();
