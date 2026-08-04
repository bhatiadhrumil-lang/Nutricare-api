export const EMERGENCY_LEVELS = Object.freeze({
  NONE: 'NONE',
  URGENT: 'URGENT',
  EMERGENCY: 'EMERGENCY',
  LIFE_THREATENING: 'LIFE_THREATENING',
});

/**
 * Configurable life-threatening thresholds for critical biomarkers.
 * Crossing these thresholds escalates emergencyLevel to LIFE_THREATENING.
 */
export const EMERGENCY_RULES = Object.freeze({
  potassium: { low: 2.0, high: 7.0 },
  sodium: { low: 115, high: 165 },
  troponin_i: { high: 0.5 },
  troponin_t: { high: 0.5 },
  fasting_plasma_glucose: { low: 2.0, high: 33.0 },
  random_plasma_glucose: { low: 2.0, high: 33.0 },
  postprandial_glucose: { low: 2.0, high: 33.0 },
  international_normalized_ratio: { high: 8.0 },
  prothrombin_time: { high: 45.0 },
  hemoglobin: { low: 50, high: 220 },
  platelet_count: { low: 10, high: 1200 },
  white_blood_cell_count: { low: 0.5, high: 50.0 },
  creatinine: { high: 700 },
  c_reactive_protein: { high: 200 },
  high_sensitivity_c_reactive_protein: { high: 200 },
  calcium: { low: 1.3, high: 3.6 },
  b_type_natriuretic_peptide: { high: 2000 },
  n_terminal_pro_bnp: { high: 10000 },
});

export default EMERGENCY_RULES;
