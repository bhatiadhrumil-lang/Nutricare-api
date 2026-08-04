export const RISK_LEVELS = Object.freeze({
  VERY_LOW_RISK: 'VERY_LOW_RISK',
  LOW_RISK: 'LOW_RISK',
  MODERATE_RISK: 'MODERATE_RISK',
  HIGH_RISK: 'HIGH_RISK',
  VERY_HIGH_RISK: 'VERY_HIGH_RISK',
});

/**
 * Configurable biomarker mappings and scoring rules per medical domain.
 */
export const DOMAIN_BIOMARKER_MAP = Object.freeze({
  CBC: [
    'hemoglobin', 'hematocrit', 'red_blood_cell_count', 'white_blood_cell_count',
    'platelet_count', 'mean_corpuscular_volume', 'mean_corpuscular_hemoglobin',
    'neutrophils', 'lymphocytes', 'monocytes', 'eosinophils', 'basophils',
  ],
  Kidney: [
    'creatinine', 'blood_urea_nitrogen', 'estimated_glomerular_filtration_rate',
  ],
  Liver: [
    'alanine_aminotransferase', 'aspartate_aminotransferase', 'alkaline_phosphatase',
    'gamma_glutamyl_transferase', 'total_bilirubin', 'direct_bilirubin', 'albumin', 'total_protein',
  ],
  Diabetes: [
    'fasting_plasma_glucose', 'random_plasma_glucose', 'postprandial_glucose',
    'hemoglobin_a1c', 'estimated_average_glucose',
  ],
  Lipids: [
    'total_cholesterol', 'hdl_cholesterol', 'ldl_cholesterol', 'triglycerides',
  ],
  Thyroid: [
    'thyroid_stimulating_hormone',
  ],
  Electrolytes: [
    'sodium', 'potassium', 'chloride', 'bicarbonate', 'calcium', 'magnesium', 'phosphorus',
  ],
  Vitamins: [
    'vitamin_d_25_hydroxy', 'vitamin_b12', 'folate', 'vitamin_a', 'vitamin_c',
  ],
  Inflammation: [
    'high_sensitivity_c_reactive_protein', 'c_reactive_protein',
  ],
  Cardiac: [
    'troponin_i', 'troponin_t', 'b_type_natriuretic_peptide', 'n_terminal_pro_bnp',
    'creatine_kinase', 'creatine_kinase_mb', 'homocysteine',
  ],
});

export const SEVERITY_PENALTIES = Object.freeze({
  NORMAL: 0,
  MILD_LOW: 10,
  MILD_HIGH: 10,
  MODERATE_LOW: 25,
  MODERATE_HIGH: 25,
  SEVERE_LOW: 45,
  SEVERE_HIGH: 45,
  CRITICAL_LOW: 70,
  CRITICAL_HIGH: 70,
  UNKNOWN: 5,
});

/**
 * Maps a numerical domain score (0-100) to a risk level classification.
 */
export function classifyRiskLevel(score) {
  if (typeof score !== 'number' || isNaN(score)) return RISK_LEVELS.VERY_HIGH_RISK;
  if (score >= 90) return RISK_LEVELS.VERY_LOW_RISK;
  if (score >= 75) return RISK_LEVELS.LOW_RISK;
  if (score >= 60) return RISK_LEVELS.MODERATE_RISK;
  if (score >= 40) return RISK_LEVELS.HIGH_RISK;
  return RISK_LEVELS.VERY_HIGH_RISK;
}

export default { DOMAIN_BIOMARKER_MAP, SEVERITY_PENALTIES, RISK_LEVELS, classifyRiskLevel };
