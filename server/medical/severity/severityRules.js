/**
 * Parameter-specific thresholds expressed as a fraction of the applicable
 * normalized reference boundary. They are configuration, not universal
 * percentage logic: each biomarker can carry its own low/high policy.
 */
const STANDARD_LOW = Object.freeze({ mild: 1, moderate: 0.85, severe: 0.7, critical: 0.55 });
const STANDARD_HIGH = Object.freeze({ mild: 1, moderate: 1.25, severe: 1.5, critical: 2 });

export const SEVERITY_RULES = Object.freeze({
  // CBC
  hemoglobin: { low: { mild: 1, moderate: 0.85, severe: 0.7, critical: 0.55 }, high: STANDARD_HIGH },
  hematocrit: { low: STANDARD_LOW, high: STANDARD_HIGH },
  red_blood_cell_count: { low: STANDARD_LOW, high: STANDARD_HIGH },
  white_blood_cell_count: { low: STANDARD_LOW, high: { mild: 1, moderate: 1.5, severe: 2.5, critical: 4 } },
  platelet_count: { low: { mild: 1, moderate: 0.75, severe: 0.5, critical: 0.2 }, high: { mild: 1, moderate: 1.5, severe: 2, critical: 3 } },
  mean_corpuscular_volume: { low: STANDARD_LOW, high: STANDARD_HIGH },
  mean_corpuscular_hemoglobin: { low: STANDARD_LOW, high: STANDARD_HIGH },
  mean_corpuscular_hemoglobin_concentration: { low: STANDARD_LOW, high: STANDARD_HIGH },
  red_cell_distribution_width: { high: { mild: 1, moderate: 1.15, severe: 1.3, critical: 1.5 } },
  mean_platelet_volume: { low: STANDARD_LOW, high: STANDARD_HIGH },
  neutrophils: { low: { mild: 1, moderate: 0.7, severe: 0.4, critical: 0.2 }, high: { mild: 1, moderate: 1.3, severe: 1.6, critical: 2 } },
  lymphocytes: { low: { mild: 1, moderate: 0.7, severe: 0.5, critical: 0.3 }, high: { mild: 1, moderate: 1.5, severe: 2, critical: 3 } },
  monocytes: { low: STANDARD_LOW, high: { mild: 1, moderate: 1.5, severe: 2.5, critical: 4 } },
  eosinophils: { high: { mild: 1, moderate: 2, severe: 4, critical: 8 } },
  basophils: { high: { mild: 1, moderate: 2, severe: 4, critical: 8 } },
  reticulocyte_count: { low: STANDARD_LOW, high: { mild: 1, moderate: 1.5, severe: 2.5, critical: 4 } },

  // Kidney
  creatinine: { high: { mild: 1, moderate: 1.5, severe: 2.5, critical: 4 } },
  blood_urea_nitrogen: { high: { mild: 1, moderate: 1.4, severe: 2, critical: 3 } },
  estimated_glomerular_filtration_rate: { low: { mild: 1, moderate: 0.67, severe: 0.33, critical: 0.17 } },

  // Liver
  alanine_aminotransferase: { high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  aspartate_aminotransferase: { high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  alkaline_phosphatase: { high: { mild: 1, moderate: 1.5, severe: 3, critical: 6 } },
  gamma_glutamyl_transferase: { high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  lactate_dehydrogenase: { high: { mild: 1, moderate: 1.5, severe: 2.5, critical: 5 } },
  total_bilirubin: { high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  direct_bilirubin: { high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  total_protein: { low: STANDARD_LOW, high: STANDARD_HIGH },
  albumin: { low: { mild: 1, moderate: 0.85, severe: 0.7, critical: 0.55 }, high: STANDARD_HIGH },
  globulin: { low: STANDARD_LOW, high: STANDARD_HIGH },
  bilirubin: { high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },

  // Lipids
  total_cholesterol: { high: { mild: 1, moderate: 1.15, severe: 1.35, critical: 1.75 } },
  hdl_cholesterol: { low: { mild: 1, moderate: 0.8, severe: 0.6, critical: 0.4 } },
  ldl_cholesterol: { high: { mild: 1, moderate: 1.2, severe: 1.5, critical: 2 } },
  triglycerides: { high: { mild: 1, moderate: 1.5, severe: 2.5, critical: 5 } },

  // Electrolytes
  sodium: { low: { mild: 1, moderate: 0.93, severe: 0.88, critical: 0.82 }, high: { mild: 1, moderate: 1.07, severe: 1.12, critical: 1.18 } },
  potassium: { low: { mild: 1, moderate: 0.85, severe: 0.7, critical: 0.6 }, high: { mild: 1, moderate: 1.2, severe: 1.35, critical: 1.5 } },
  chloride: { low: { mild: 1, moderate: 0.9, severe: 0.8, critical: 0.7 }, high: { mild: 1, moderate: 1.1, severe: 1.2, critical: 1.3 } },
  bicarbonate: { low: { mild: 1, moderate: 0.8, severe: 0.65, critical: 0.5 }, high: { mild: 1, moderate: 1.2, severe: 1.35, critical: 1.5 } },
  calcium: { low: { mild: 1, moderate: 0.9, severe: 0.8, critical: 0.7 }, high: { mild: 1, moderate: 1.15, severe: 1.3, critical: 1.5 } },
  ionized_calcium: { low: { mild: 1, moderate: 0.9, severe: 0.8, critical: 0.7 }, high: { mild: 1, moderate: 1.15, severe: 1.3, critical: 1.5 } },
  magnesium: { low: { mild: 1, moderate: 0.8, severe: 0.65, critical: 0.5 }, high: { mild: 1, moderate: 1.25, severe: 1.5, critical: 2 } },
  phosphorus: { low: { mild: 1, moderate: 0.75, severe: 0.5, critical: 0.3 }, high: { mild: 1, moderate: 1.3, severe: 1.6, critical: 2 } },

  // Hormones, vitamins, and iron
  thyroid_stimulating_hormone: { low: { mild: 1, moderate: 0.5, severe: 0.25, critical: 0.1 }, high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  vitamin_d_25_hydroxy: { low: { mild: 1, moderate: 0.75, severe: 0.5, critical: 0.25 } },
  vitamin_b12: { low: { mild: 1, moderate: 0.75, severe: 0.5, critical: 0.25 } },
  folate: { low: { mild: 1, moderate: 0.75, severe: 0.5, critical: 0.25 } },
  ferritin: { low: { mild: 1, moderate: 0.65, severe: 0.35, critical: 0.15 }, high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  serum_iron: { low: STANDARD_LOW, high: STANDARD_HIGH },
  total_iron_binding_capacity: { low: STANDARD_LOW, high: STANDARD_HIGH },
  transferrin_saturation: { low: { mild: 1, moderate: 0.7, severe: 0.4, critical: 0.2 }, high: { mild: 1, moderate: 1.5, severe: 2, critical: 2.5 } },
  cortisol: { low: { mild: 1, moderate: 0.6, severe: 0.3, critical: 0.15 }, high: { mild: 1, moderate: 1.5, severe: 2.5, critical: 4 } },
  testosterone_total: { low: { mild: 1, moderate: 0.7, severe: 0.4, critical: 0.2 }, high: { mild: 1, moderate: 1.5, severe: 2.5, critical: 4 } },
  estradiol: { low: STANDARD_LOW, high: STANDARD_HIGH },

  // Cardiac and glucose
  troponin_i: { high: { mild: 1, moderate: 3, severe: 10, critical: 25 } },
  troponin_t: { high: { mild: 1, moderate: 3, severe: 10, critical: 25 } },
  b_type_natriuretic_peptide: { high: { mild: 1, moderate: 2, severe: 4, critical: 10 } },
  n_terminal_pro_bnp: { high: { mild: 1, moderate: 2, severe: 4, critical: 10 } },
  creatine_kinase: { high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  creatine_kinase_mb: { high: { mild: 1, moderate: 2, severe: 5, critical: 10 } },
  high_sensitivity_c_reactive_protein: { high: { mild: 1, moderate: 3, severe: 10, critical: 20 } },
  fasting_plasma_glucose: { high: { mild: 1, moderate: 1.25, severe: 1.7, critical: 2.5 }, low: { mild: 1, moderate: 0.8, severe: 0.65, critical: 0.5 } },
  random_plasma_glucose: { high: { mild: 1, moderate: 1.25, severe: 1.7, critical: 2.5 }, low: { mild: 1, moderate: 0.8, severe: 0.65, critical: 0.5 } },
  postprandial_glucose: { high: { mild: 1, moderate: 1.25, severe: 1.7, critical: 2.5 }, low: { mild: 1, moderate: 0.8, severe: 0.65, critical: 0.5 } },
  hemoglobin_a1c: { high: { mild: 1, moderate: 1.15, severe: 1.35, critical: 1.6 } },
});

export default SEVERITY_RULES;
