// Force the JSON-file fallback so this test stays hermetic and fast
// (no network/Postgres dependency). db.service reads PG* env vars at
// require-time to decide between Postgres and file mode.
for (const k of ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGPORT', 'PGSSLMODE', 'PGCHANNELBINDING']) {
  delete process.env[k];
}

const test = require('node:test');
const assert = require('node:assert/strict');
const dbService = require('../services/db.service');

test('dbService: initializes default user and calculates AI personalization', async () => {
  const userId = `test_user_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const userData = await dbService.getUser(userId, 'test@example.com');

  assert.equal(userData.profile.email, 'test@example.com');
  assert.equal(userData.healthGoals.length, 0);

  // Update profile
  await dbService.updateUserSection(userId, 'profile', {
    fullName: 'Jane Doe',
    gender: 'Female',
    height: 168,
    weight: 60,
    activityLevel: 'Moderate',
  });

  // Update preferences
  await dbService.updateUserSection(userId, 'preferences', {
    dietType: 'Vegetarian',
    preferredCuisines: ['Indian'],
    foodAllergies: ['Peanuts'],
    exerciseFrequency: '3-4 times/week',
  });

  // Update goals
  await dbService.updateUserSection(userId, 'healthGoals', ['improve_nutrition', 'improve_immunity']);

  const status = await dbService.getAiPersonalizationStatus(userId);
  assert.ok(status.completionPercentage > 50, 'Completion percentage should reflect populated fields');
  assert.ok(status.completed.length >= 6);
});

test('dbService: tracks report summary correctly', async () => {
  const userId = `test_user_rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await dbService.addReportRecord(userId, {
    fileName: 'Blood_Test_Aug.pdf',
    uploadedAt: new Date().toISOString(),
    status: 'Completed',
    disease: 'Lipid profile review',
    healthScore: 85,
  });

  const summary = await dbService.getReportsSummary(userId);
  assert.equal(summary.totalReports, 1);
  assert.equal(summary.latestReportName, 'Blood_Test_Aug.pdf');
  assert.equal(summary.analyzedReportsCount, 1);
});
