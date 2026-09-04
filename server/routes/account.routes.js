const express = require('express');
const { authenticateCognitoToken } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getHealthGoals,
  updateHealthGoals,
  getMedicalInformation,
  updateMedicalInformation,
  getReportsSummary,
  getAiPersonalization,
} = require('../controllers/account.controller');

const router = express.Router();

router.get('/profile', authenticateCognitoToken, getProfile);
router.put('/profile', authenticateCognitoToken, updateProfile);

router.get('/preferences', authenticateCognitoToken, getPreferences);
router.put('/preferences', authenticateCognitoToken, updatePreferences);

router.get('/health-goals', authenticateCognitoToken, getHealthGoals);
router.put('/health-goals', authenticateCognitoToken, updateHealthGoals);

router.get('/medical-information', authenticateCognitoToken, getMedicalInformation);
router.put('/medical-information', authenticateCognitoToken, updateMedicalInformation);

router.get('/reports/summary', authenticateCognitoToken, getReportsSummary);

router.get('/ai-personalization', authenticateCognitoToken, getAiPersonalization);

module.exports = router;
