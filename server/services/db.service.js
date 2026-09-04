const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// ============================================================================
// NutriHealth data layer
// ----------------------------------------------------------------------------
// Persists user data to Postgres (Neon) when PG* env vars are present, and
// transparently falls back to a JSON file store otherwise (used by the test
// suite and for local runs without a database).
//
// The public API is identical in both modes, but every method is ASYNC because
// Postgres access is non-blocking. Callers MUST `await` these functions.
// ============================================================================

// ─── Postgres availability detection ────────────────────────────────────────
// Start optimistically in Postgres mode when the env vars are present, but the
// real test happens in initializeDatabase(): if a connection can't be made
// (e.g. locked-down network / offline demo / sandbox with no DB egress), we
// downgrade to the JSON file store so the app keeps working.
const pgConfigured = Boolean(
  process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER && process.env.PGPASSWORD
);

let dbMode = pgConfigured ? 'postgres' : 'file';

// ─── SSL config from libpq-style env vars ───────────────────────────────────
// PGSSLMODE: disable | require | verify-ca | verify-full
// PGCHANNELBINDING: require (implies SSL is mandatory)
function buildSslConfig() {
  const sslmode = (process.env.PGSSLMODE || '').toLowerCase();
  const channelBinding = (process.env.PGCHANNELBINDING || '').toLowerCase();

  if (sslmode === 'disable') return false;

  // Any of these require an encrypted connection.
  const needsSsl = sslmode === 'require' || sslmode === 'verify-ca' || sslmode === 'verify-full' || channelBinding === 'require';
  if (!needsSsl) return false;

  // verify-full/verify-ca validate the server certificate chain + hostname.
  const verify = sslmode === 'verify-full' || sslmode === 'verify-ca';
  return { require: true, rejectUnauthorized: verify };
}

// ─── Postgres pool (lazy) ──────────────────────────────────────────────────
let pool = null;
function getPool() {
  if (dbMode !== 'postgres') return null;
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      port: Number(process.env.PGPORT) || 5432,
      ssl: buildSslConfig(),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });

    // Never crash the process on a transient pool error.
    pool.on('error', (err) => {
      console.error('[DB Service] Unexpected Postgres pool error:', err.message);
    });
  }
  return pool;
}

// ─── JSON file fallback ─────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial structure for a new user (shared by file mode + demo seeding)
function getDefaultUserData(email = '') {
  return {
    profile: {
      fullName: '',
      email: email || '',
      phone: '',
      dob: '',
      gender: '',
      height: null,
      weight: null,
      activityLevel: '',
    },
    preferences: {
      dietType: '',
      preferredCuisines: [],
      favoriteFoods: [],
      foodsToAvoid: [],
      foodAllergies: [],
      dietaryRestrictions: [],
      activityLevel: '',
      exerciseFrequency: '',
      sleepDuration: 7,
      waterGoal: 2.5,
    },
    healthGoals: [],
    medicalInformation: {
      conditions: [],
      allergies: [],
      medications: [],
      notes: '',
    },
    reports: [],
  };
}

let fileCache = null;

function readFileDB() {
  if (fileCache) return fileCache;
  if (!fs.existsSync(DB_FILE)) {
    fileCache = { users: {} };
    writeFileDB(fileCache);
    return fileCache;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    fileCache = JSON.parse(raw);
    if (!fileCache.users) fileCache.users = {};
    return fileCache;
  } catch (err) {
    console.error('[DB Service] Error reading store file:', err.message);
    fileCache = { users: {} };
    return fileCache;
  }
}

function writeFileDB(data) {
  fileCache = data;
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getFileUser(userId, defaultEmail = '') {
  const db = readFileDB();
  if (!db.users[userId]) {
    db.users[userId] = getDefaultUserData(defaultEmail);
    writeFileDB(db);
  }
  return db.users[userId];
}

// ─── Schema (idempotent) ───────────────────────────────────────────────────
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_data (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  health_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  medical_information JSONB NOT NULL DEFAULT '{}'::jsonb,
  reports JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

// Map a controller section name to its JSONB column + whether it is an array.
const SECTION_MAP = {
  profile: { column: 'profile', isArray: false },
  preferences: { column: 'preferences', isArray: false },
  healthGoals: { column: 'health_goals', isArray: true },
  medicalInformation: { column: 'medical_information', isArray: false },
};

// Ensure the user (and their data row) exist.
async function ensureUserPg(userId, defaultEmail = '') {
  const p = getPool();
  await p.query(
    `INSERT INTO users (id, email) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
     WHERE users.email IS DISTINCT FROM EXCLUDED.email`,
    [userId, defaultEmail || null]
  );
  await p.query(
    `INSERT INTO user_data (user_id, profile) VALUES ($1, $2::jsonb)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, JSON.stringify({ email: defaultEmail || '' })]
  );
}

async function getUserPg(userId, defaultEmail = '') {
  const p = getPool();
  await ensureUserPg(userId, defaultEmail);
  const res = await p.query(
    `SELECT profile, preferences, health_goals, medical_information, reports
     FROM user_data WHERE user_id = $1`,
    [userId]
  );
  if (res.rows.length === 0) {
    // Defensive: race condition — recreate.
    await ensureUserPg(userId, defaultEmail);
    const res2 = await p.query(
      `SELECT profile, preferences, health_goals, medical_information, reports
       FROM user_data WHERE user_id = $1`,
      [userId]
    );
    if (res2.rows.length === 0) throw new Error('Unable to create user data row');
    return rowToUserData(res2.rows[0]);
  }
  return rowToUserData(res.rows[0]);
}

function rowToUserData(row) {
  // Merge onto defaults so newly-created rows (which start as empty jsonb)
  // still expose the full shape expected by callers (e.g. profile.email,
  // preferences.sleepDuration). This mirrors the file-store behavior.
  const base = getDefaultUserData();
  return {
    profile: { ...base.profile, ...(row.profile || {}) },
    preferences: { ...base.preferences, ...(row.preferences || {}) },
    healthGoals: Array.isArray(row.health_goals) ? row.health_goals : [],
    medicalInformation: { ...base.medicalInformation, ...(row.medical_information || {}) },
    reports: Array.isArray(row.reports) ? row.reports : [],
  };
}

async function updateUserSectionPg(userId, section, updates) {
  if (!userId) throw new Error('User ID is required');
  const mapping = SECTION_MAP[section];
  if (!mapping) throw new Error(`Unknown section: ${section}`);

  const p = getPool();
  await ensureUserPg(userId);

  let setClause;
  if (mapping.isArray) {
    setClause = `${mapping.column} = $2::jsonb`;
  } else {
    setClause = `${mapping.column} = ${mapping.column} || $2::jsonb`;
  }

  const res = await p.query(
    `UPDATE user_data
     SET ${setClause}, updated_at = now()
     WHERE user_id = $1
     RETURNING ${mapping.column}`,
    [userId, JSON.stringify(updates)]
  );

  const stored = res.rows[0][mapping.column];
  // Merge onto defaults so callers receive the same complete shape the file
  // store would return (e.g. preferences.sleepDuration, profile.email).
  if (mapping.isArray) return stored;
  return { ...getDefaultUserData()[mapping.column === 'profile' ? 'profile' : mapping.column === 'preferences' ? 'preferences' : 'medicalInformation'], ...stored };
}

async function addReportRecordPg(userId, reportData) {
  if (!userId) throw new Error('User ID is required');
  const p = getPool();
  await ensureUserPg(userId);

  const reportRecord = {
    id: reportData.id || `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    fileName: reportData.fileName || 'Blood_Report.pdf',
    uploadedAt: reportData.uploadedAt || new Date().toISOString(),
    status: reportData.status || 'Completed',
    disease: reportData.disease || null,
    healthScore: reportData.healthScore || null,
  };

  await p.query(
    `UPDATE user_data
     SET reports = jsonb_build_array($2::jsonb) || reports, updated_at = now()
     WHERE user_id = $1`,
    [userId, JSON.stringify(reportRecord)]
  );

  return reportRecord;
}

async function getReportsSummaryPg(userId) {
  const userData = await getUserPg(userId);
  return computeReportsSummary(userData.reports || []);
}

// ─── Pure helpers (shared by both modes) ────────────────────────────────────
function computeReportsSummary(reports) {
  const totalReports = reports.length;
  const latestReport = totalReports > 0 ? reports[0] : null;
  const analyzedReportsCount = reports.filter((r) => r.status === 'Completed').length;

  return {
    totalReports,
    latestReportName: latestReport ? latestReport.fileName : null,
    latestUploadDate: latestReport ? latestReport.uploadedAt : null,
    latestStatus: latestReport ? latestReport.status : null,
    analyzedReportsCount,
    reports: reports.slice(0, 5),
  };
}

function computeAiPersonalization(userData) {
  const { profile, preferences, healthGoals } = userData;

  const factors = [
    { key: 'basic_profile', label: 'Basic Profile (Name, Email & Gender)', isComplete: Boolean(profile.fullName && profile.gender) },
    { key: 'body_metrics', label: 'Body Metrics (Height & Weight)', isComplete: Boolean(profile.height && profile.weight) },
    { key: 'activity_level', label: 'Activity Level', isComplete: Boolean(profile.activityLevel || preferences.activityLevel) },
    { key: 'diet_preference', label: 'Dietary Preference', isComplete: Boolean(preferences.dietType) },
    { key: 'food_allergies', label: 'Food Allergies & Restrictions', isComplete: Boolean((preferences.foodAllergies && preferences.foodAllergies.length > 0) || (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0)) },
    { key: 'food_preferences', label: 'Food Preferences & Cuisines', isComplete: Boolean((preferences.preferredCuisines && preferences.preferredCuisines.length > 0) || (preferences.foodsToAvoid && preferences.foodsToAvoid.length > 0) || (preferences.favoriteFoods && preferences.favoriteFoods.length > 0)) },
    { key: 'health_goals', label: 'Health Goals', isComplete: Boolean(healthGoals && healthGoals.length > 0) },
    { key: 'lifestyle_info', label: 'Lifestyle & Hydration Goals', isComplete: Boolean(preferences.exerciseFrequency || preferences.waterGoal) },
  ];

  const completedFactors = factors.filter((f) => f.isComplete);
  const incompleteFactors = factors.filter((f) => !f.isComplete);
  const percentage = Math.round((completedFactors.length / factors.length) * 100);

  let summary = 'Your AI profile is optimized for personalized nutrition recommendations.';
  if (percentage < 100) {
    const remaining = incompleteFactors.length;
    summary = `Complete ${remaining} more section${remaining > 1 ? 's' : ''} to improve recommendation personalization.`;
  }

  return {
    completionPercentage: percentage,
    completed: completedFactors.map((f) => f.label),
    incomplete: incompleteFactors.map((f) => f.label),
    summary,
    isMedicalInfoProvided: Boolean(
      userData.medicalInformation.conditions.length > 0 ||
      userData.medicalInformation.allergies.length > 0 ||
      userData.medicalInformation.medications.length > 0 ||
      userData.medicalInformation.notes
    ),
  };
}

// ─── Public async API ────────────────────────────────────────────────────────
async function getUser(userId, defaultEmail = '') {
  if (!userId) throw new Error('User ID is required');
  if (dbMode === 'postgres') return getUserPg(userId, defaultEmail);

  const userData = getFileUser(userId, defaultEmail);
  return userData;
}

async function updateUserSection(userId, section, updates) {
  if (dbMode === 'postgres') return updateUserSectionPg(userId, section, updates);

  if (!userId) throw new Error('User ID is required');
  const db = readFileDB();
  if (!db.users[userId]) db.users[userId] = getDefaultUserData();

  if (section === 'healthGoals') {
    db.users[userId].healthGoals = Array.isArray(updates) ? updates : [];
  } else {
    db.users[userId][section] = { ...db.users[userId][section], ...updates };
  }
  writeFileDB(db);
  return db.users[userId][section];
}

async function addReportRecord(userId, reportData) {
  if (dbMode === 'postgres') return addReportRecordPg(userId, reportData);

  if (!userId) throw new Error('User ID is required');
  const db = readFileDB();
  if (!db.users[userId]) db.users[userId] = getDefaultUserData();

  const reportRecord = {
    id: reportData.id || `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    fileName: reportData.fileName || 'Blood_Report.pdf',
    uploadedAt: reportData.uploadedAt || new Date().toISOString(),
    status: reportData.status || 'Completed',
    disease: reportData.disease || null,
    healthScore: reportData.healthScore || null,
  };
  db.users[userId].reports.unshift(reportRecord);
  writeFileDB(db);
  return reportRecord;
}

async function getReportsSummary(userId) {
  if (dbMode === 'postgres') return getReportsSummaryPg(userId);
  const userData = await getUser(userId);
  return computeReportsSummary(userData.reports || []);
}

async function getAiPersonalizationStatus(userId) {
  const userData = await getUser(userId);
  return computeAiPersonalization(userData);
}

// ─── Initialization (called once at server startup) ──────────────────────────
// Creates the schema against Postgres. When the database is empty, seeds it
// from the existing JSON store (preserving any demo data) — but never
// overwrites rows that already exist.
async function initializeDatabase({ seedFromJson = true } = {}) {
  if (dbMode !== 'postgres') {
    console.log('[DB Service] Postgres not configured — using JSON file store fallback.');
    return { mode: 'file' };
  }

  const p = getPool();
  try {
    // Probe connectivity with a short timeout. If the DB is unreachable (e.g.
    // offline demo / sandbox without egress), downgrade to the JSON file store
    // instead of failing every request.
    const probe = await Promise.race([
      p.query('SELECT 1'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Postgres connection timed out')), 6000)
      ),
    ]);
    if (!probe) throw new Error('Postgres probe failed');

    await p.query(SCHEMA_SQL);
    console.log('[DB Service] Postgres schema ensured.');
  } catch (err) {
    dbMode = 'file';
    console.warn(
      `[DB Service] Postgres unreachable (${err.message}) — falling back to JSON file store.`
    );
    return { mode: 'file', reason: err.message };
  }

  if (seedFromJson && fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const store = JSON.parse(raw);
      const userIds = Object.keys(store.users || {});
      if (userIds.length > 0) {
        const { rows } = await p.query('SELECT COUNT(*)::int AS c FROM users');
        if (rows[0].c === 0) {
          for (const uid of userIds) {
            const d = store.users[uid];
            await ensureUserPg(uid, d.profile?.email || '');
            await p.query(
              `UPDATE user_data SET
                 profile = $2::jsonb,
                 preferences = $3::jsonb,
                 health_goals = $4::jsonb,
                 medical_information = $5::jsonb,
                 reports = $6::jsonb,
                 updated_at = now()
               WHERE user_id = $1`,
              [
                uid,
                JSON.stringify(d.profile || {}),
                JSON.stringify(d.preferences || {}),
                JSON.stringify(d.healthGoals || []),
                JSON.stringify(d.medicalInformation || {}),
                JSON.stringify(d.reports || []),
              ]
            );
          }
          console.log(`[DB Service] Seeded ${userIds.length} demo user(s) from JSON store.`);
        } else {
          console.log('[DB Service] Database already has users — skipping JSON seed.');
        }
      }
    } catch (err) {
      console.warn('[DB Service] JSON seed skipped:', err.message);
    }
  }

  return { mode: 'postgres' };
}

function getDbMode() {
  return dbMode;
}

module.exports = {
  getUser,
  updateUserSection,
  addReportRecord,
  getReportsSummary,
  getAiPersonalizationStatus,
  initializeDatabase,
  getDbMode,
  // exposed for health checks / debugging
  _pool: getPool,
};
