/**
 * Configurable clinical relationship rules for detecting biomarker patterns
 * and physiological contradictions across laboratory categories.
 *
 * NOTE: These rules describe cross-parameter relationships only and do NOT diagnose diseases.
 */

export const PATTERN_RULES = Object.freeze([
  {
    id: 'iron_depletion_pattern',
    name: 'Iron Depletion Biomarker Pattern',
    category: 'Iron Studies',
    description: 'Reduced ferritin level observed alongside decreased serum iron.',
    conditions: [
      { parameter: 'ferritin', statusIn: ['LOW', 'CRITICAL_LOW'] },
      { parameter: 'serum_iron', statusIn: ['LOW', 'CRITICAL_LOW'] },
    ],
  },
  {
    id: 'diabetes_glycemic_pattern',
    name: 'Glycemic Elevation Pattern',
    category: 'Diabetes',
    description: 'Elevated fasting plasma glucose observed alongside elevated hemoglobin A1c.',
    conditions: [
      { parameter: 'fasting_plasma_glucose', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
      { parameter: 'hemoglobin_a1c', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
    ],
  },
  {
    id: 'kidney_azotemia_pattern',
    name: 'Renal Retention Pattern',
    category: 'Kidney',
    description: 'Elevated creatinine level accompanied by increased blood urea nitrogen.',
    conditions: [
      { parameter: 'creatinine', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
      { parameter: 'blood_urea_nitrogen', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
    ],
  },
  {
    id: 'liver_hepatocellular_pattern',
    name: 'Hepatocellular Enzyme Pattern',
    category: 'Liver',
    description: 'Elevated alanine aminotransferase (ALT) observed concurrently with elevated aspartate aminotransferase (AST).',
    conditions: [
      { parameter: 'alanine_aminotransferase', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
      { parameter: 'aspartate_aminotransferase', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
    ],
  },
  {
    id: 'cbc_anemic_indices_pattern',
    name: 'Red Cell Index Reduction Pattern',
    category: 'CBC',
    description: 'Decreased hemoglobin concentration accompanied by reduced hematocrit percentage.',
    conditions: [
      { parameter: 'hemoglobin', statusIn: ['LOW', 'CRITICAL_LOW'] },
      { parameter: 'hematocrit', statusIn: ['LOW', 'CRITICAL_LOW'] },
    ],
  },
  {
    id: 'lipid_atherogenic_pattern',
    name: 'Atherogenic Lipid Pattern',
    category: 'Lipids',
    description: 'Elevated total cholesterol observed alongside increased LDL cholesterol.',
    conditions: [
      { parameter: 'total_cholesterol', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
      { parameter: 'ldl_cholesterol', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
    ],
  },
  {
    id: 'inflammation_acute_phase_pattern',
    name: 'Inflammatory Biomarker Co-elevation',
    category: 'Inflammation',
    description: 'Elevated C-reactive protein accompanied by elevated white blood cell count.',
    conditions: [
      { parameter: 'high_sensitivity_c_reactive_protein', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
      { parameter: 'white_blood_cell_count', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
    ],
  },
  {
    id: 'electrolyte_hyponatremic_hypokalemic_pattern',
    name: 'Dual Cation Reduction Pattern',
    category: 'Electrolytes',
    description: 'Decreased serum sodium level observed concurrently with reduced serum potassium.',
    conditions: [
      { parameter: 'sodium', statusIn: ['LOW', 'CRITICAL_LOW'] },
      { parameter: 'potassium', statusIn: ['LOW', 'CRITICAL_LOW'] },
    ],
  },
]);

export const CONTRADICTION_RULES = Object.freeze([
  {
    id: 'kidney_creatinine_egfr_discordance',
    category: 'Kidney',
    description: 'High creatinine level observed simultaneously with elevated estimated glomerular filtration rate (eGFR).',
    severity: 'MODERATE',
    conditions: [
      { parameter: 'creatinine', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
      { parameter: 'estimated_glomerular_filtration_rate', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
    ],
  },
  {
    id: 'cbc_hb_hct_discordance',
    category: 'CBC',
    description: 'Reduced hemoglobin concentration discordant with elevated hematocrit percentage.',
    severity: 'HIGH',
    conditions: [
      { parameter: 'hemoglobin', statusIn: ['LOW', 'CRITICAL_LOW'] },
      { parameter: 'hematocrit', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
    ],
  },
  {
    id: 'glucose_hba1c_acute_discordance',
    category: 'Diabetes',
    description: 'Severely low fasting glucose observed concurrently with markedly elevated HbA1c.',
    severity: 'MODERATE',
    conditions: [
      { parameter: 'fasting_plasma_glucose', statusIn: ['LOW', 'CRITICAL_LOW'] },
      { parameter: 'hemoglobin_a1c', statusIn: ['HIGH', 'CRITICAL_HIGH'] },
    ],
  },
]);

export default { PATTERN_RULES, CONTRADICTION_RULES };
