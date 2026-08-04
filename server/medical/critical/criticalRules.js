/**
 * Configurable medical thresholds for Critical Low and Critical High values.
 * Thresholds are expressed in normalized canonical units for each biomarker.
 */
export const CRITICAL_RULES = Object.freeze({
  // Electrolytes
  potassium: { low: 2.8, high: 6.2 },
  sodium: { low: 120, high: 160 },
  calcium: { low: 1.6, high: 3.2 },
  ionized_calcium: { low: 0.8, high: 1.6 },
  magnesium: { low: 0.4, high: 2.0 },
  chloride: { low: 75, high: 125 },
  bicarbonate: { low: 10, high: 40 },

  // Cardiac
  troponin_i: { high: 0.1 },
  troponin_t: { high: 0.1 },
  b_type_natriuretic_peptide: { high: 1000 },
  n_terminal_pro_bnp: { high: 5000 },
  creatine_kinase_mb: { high: 25 },

  // Glucose / Metabolism
  fasting_plasma_glucose: { low: 2.8, high: 25.0 },
  random_plasma_glucose: { low: 2.8, high: 25.0 },
  postprandial_glucose: { low: 2.8, high: 25.0 },
  hemoglobin_a1c: { high: 14.0 },

  // Coagulation
  international_normalized_ratio: { high: 5.0 },
  prothrombin_time: { high: 30.0 },
  d_dimer: { high: 5.0 },

  // Hematology (CBC)
  hemoglobin: { low: 60, high: 200 },
  hematocrit: { low: 0.18, high: 0.60 },
  platelet_count: { low: 20, high: 1000 },
  white_blood_cell_count: { low: 1.5, high: 30.0 },

  // Renal & Liver
  creatinine: { high: 440 },
  blood_urea_nitrogen: { high: 35.0 },
  alanine_aminotransferase: { high: 1000 },
  aspartate_aminotransferase: { high: 1000 },
  total_bilirubin: { high: 250 },

  // Inflammation
  c_reactive_protein: { high: 100 },
  high_sensitivity_c_reactive_protein: { high: 100 },

  // Endocrine & Iron
  thyroid_stimulating_hormone: { low: 0.01, high: 40.0 },
  ferritin: { low: 5, high: 3000 },
  serum_iron: { low: 3.0, high: 50.0 },
});

export default CRITICAL_RULES;
