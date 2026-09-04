const dbService = require('../services/db.service');

const VALID_DIET_TYPES = ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Vegetarian', 'Other', ''];
const VALID_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say', ''];
const VALID_GOALS = [
  'improve_nutrition',
  'improve_immunity',
  'manage_weight',
  'gain_muscle',
  'improve_energy',
  'improve_diet_quality',
  'address_deficiencies',
  'improve_heart_health',
  'improve_digestive_health',
];

// GET /api/profile
async function getProfile(req, res) {
  try {
    const userId = req.user.sub;
    const userData = await dbService.getUser(userId, req.user.email);
    return res.json({ success: true, profile: userData.profile });
  } catch (err) {
    console.error('[Account Controller] getProfile error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to retrieve profile' });
  }
}

// PUT /api/profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.sub;
    const { fullName, phone, dob, gender, height, weight, activityLevel } = req.body || {};

    if (height !== undefined && height !== null && height !== '') {
      const numH = Number(height);
      if (isNaN(numH) || numH <= 0 || numH > 300) {
        return res.status(400).json({ success: false, error: 'Height must be a valid positive number in cm.' });
      }
    }

    if (weight !== undefined && weight !== null && weight !== '') {
      const numW = Number(weight);
      if (isNaN(numW) || numW <= 0 || numW > 500) {
        return res.status(400).json({ success: false, error: 'Weight must be a valid positive number in kg.' });
      }
    }

    if (gender && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ success: false, error: 'Invalid gender value.' });
    }

    const currentProfile = (await dbService.getUser(userId, req.user.email)).profile;
    const updatedFields = {
      fullName: fullName !== undefined ? String(fullName).trim() : currentProfile.fullName,
      email: req.user.email || currentProfile.email, // email comes from authenticated Cognito token
      phone: phone !== undefined ? String(phone).trim() : currentProfile.phone,
      dob: dob !== undefined ? String(dob).trim() : currentProfile.dob,
      gender: gender !== undefined ? gender : currentProfile.gender,
      height: height !== undefined && height !== '' ? Number(height) : currentProfile.height,
      weight: weight !== undefined && weight !== '' ? Number(weight) : currentProfile.weight,
      activityLevel: activityLevel !== undefined ? String(activityLevel).trim() : currentProfile.activityLevel,
    };

    const updatedProfile = await dbService.updateUserSection(userId, 'profile', updatedFields);
    return res.json({ success: true, profile: updatedProfile });
  } catch (err) {
    console.error('[Account Controller] updateProfile error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to save profile changes' });
  }
}

// GET /api/preferences
async function getPreferences(req, res) {
  try {
    const userId = req.user.sub;
    const userData = await dbService.getUser(userId, req.user.email);
    return res.json({ success: true, preferences: userData.preferences });
  } catch (err) {
    console.error('[Account Controller] getPreferences error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to retrieve preferences' });
  }
}

// PUT /api/preferences
async function updatePreferences(req, res) {
  try {
    const userId = req.user.sub;
    const {
      dietType,
      preferredCuisines,
      favoriteFoods,
      foodsToAvoid,
      foodAllergies,
      dietaryRestrictions,
      activityLevel,
      exerciseFrequency,
      sleepDuration,
      waterGoal,
    } = req.body || {};

    if (dietType && !VALID_DIET_TYPES.includes(dietType)) {
      return res.status(400).json({ success: false, error: 'Invalid dietary preference value.' });
    }

    if (sleepDuration !== undefined && sleepDuration !== null && sleepDuration !== '') {
      const numS = Number(sleepDuration);
      if (isNaN(numS) || numS < 0 || numS > 24) {
        return res.status(400).json({ success: false, error: 'Sleep duration must be between 0 and 24 hours.' });
      }
    }

    if (waterGoal !== undefined && waterGoal !== null && waterGoal !== '') {
      const numW = Number(waterGoal);
      if (isNaN(numW) || numW < 0 || numW > 15) {
        return res.status(400).json({ success: false, error: 'Water intake goal must be between 0 and 15 L.' });
      }
    }

    const currentPreferences = (await dbService.getUser(userId, req.user.email)).preferences;
    const updatedFields = {
      dietType: dietType !== undefined ? dietType : currentPreferences.dietType,
      preferredCuisines: Array.isArray(preferredCuisines) ? preferredCuisines : currentPreferences.preferredCuisines,
      favoriteFoods: Array.isArray(favoriteFoods) ? favoriteFoods : currentPreferences.favoriteFoods,
      foodsToAvoid: Array.isArray(foodsToAvoid) ? foodsToAvoid : currentPreferences.foodsToAvoid,
      foodAllergies: Array.isArray(foodAllergies) ? foodAllergies : currentPreferences.foodAllergies,
      dietaryRestrictions: Array.isArray(dietaryRestrictions) ? dietaryRestrictions : currentPreferences.dietaryRestrictions,
      activityLevel: activityLevel !== undefined ? String(activityLevel).trim() : currentPreferences.activityLevel,
      exerciseFrequency: exerciseFrequency !== undefined ? String(exerciseFrequency).trim() : currentPreferences.exerciseFrequency,
      sleepDuration: sleepDuration !== undefined && sleepDuration !== '' ? Number(sleepDuration) : currentPreferences.sleepDuration,
      waterGoal: waterGoal !== undefined && waterGoal !== '' ? Number(waterGoal) : currentPreferences.waterGoal,
    };

    const updatedPreferences = await dbService.updateUserSection(userId, 'preferences', updatedFields);
    return res.json({ success: true, preferences: updatedPreferences });
  } catch (err) {
    console.error('[Account Controller] updatePreferences error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to save preferences' });
  }
}

// GET /api/health-goals
async function getHealthGoals(req, res) {
  try {
    const userId = req.user.sub;
    const userData = await dbService.getUser(userId, req.user.email);
    return res.json({ success: true, healthGoals: userData.healthGoals });
  } catch (err) {
    console.error('[Account Controller] getHealthGoals error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to retrieve health goals' });
  }
}

// PUT /api/health-goals
async function updateHealthGoals(req, res) {
  try {
    const userId = req.user.sub;
    const { healthGoals } = req.body || {};

    if (!Array.isArray(healthGoals)) {
      return res.status(400).json({ success: false, error: 'Health goals must be an array.' });
    }

    const invalidGoal = healthGoals.find((g) => !VALID_GOALS.includes(g));
    if (invalidGoal) {
      return res.status(400).json({ success: false, error: `Invalid health goal: ${invalidGoal}` });
    }

    const updatedGoals = await dbService.updateUserSection(userId, 'healthGoals', healthGoals);
    return res.json({ success: true, healthGoals: updatedGoals });
  } catch (err) {
    console.error('[Account Controller] updateHealthGoals error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to save health goals' });
  }
}

// GET /api/medical-information
async function getMedicalInformation(req, res) {
  try {
    const userId = req.user.sub;
    const userData = await dbService.getUser(userId, req.user.email);
    return res.json({ success: true, medicalInformation: userData.medicalInformation });
  } catch (err) {
    console.error('[Account Controller] getMedicalInformation error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to retrieve medical information' });
  }
}

// PUT /api/medical-information
async function updateMedicalInformation(req, res) {
  try {
    const userId = req.user.sub;
    const { conditions, allergies, medications, notes } = req.body || {};

    const currentMed = (await dbService.getUser(userId, req.user.email)).medicalInformation;
    const updatedFields = {
      conditions: Array.isArray(conditions) ? conditions : currentMed.conditions,
      allergies: Array.isArray(allergies) ? allergies : currentMed.allergies,
      medications: Array.isArray(medications) ? medications : currentMed.medications,
      notes: notes !== undefined ? String(notes).trim() : currentMed.notes,
    };

    // NOTE: Sensitive medical information is NOT logged here in server console
    const updatedMedical = await dbService.updateUserSection(userId, 'medicalInformation', updatedFields);
    return res.json({ success: true, medicalInformation: updatedMedical });
  } catch (err) {
    console.error('[Account Controller] updateMedicalInformation error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to save medical information' });
  }
}

// GET /api/reports/summary
async function getReportsSummary(req, res) {
  try {
    const userId = req.user.sub;
    const summary = await dbService.getReportsSummary(userId);
    return res.json({ success: true, summary });
  } catch (err) {
    console.error('[Account Controller] getReportsSummary error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to retrieve reports summary' });
  }
}

// GET /api/ai-personalization
async function getAiPersonalization(req, res) {
  try {
    const userId = req.user.sub;
    const personalization = await dbService.getAiPersonalizationStatus(userId);
    return res.json({ success: true, personalization });
  } catch (err) {
    console.error('[Account Controller] getAiPersonalization error:', err.message);
    return res.status(500).json({ success: false, error: 'Unable to retrieve AI personalization status' });
  }
}

module.exports = {
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
};
