export const CANONICAL_UNITS = {
  // CBC parameters
  'hemoglobin': { canonicalUnit: 'g/L', conversionFactors: { 'g/dL': 10, 'mg/dL': 0.01, 'g/L': 1 } },
  'hematocrit': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'red_blood_cell_count': { canonicalUnit: '10^12/L', conversionFactors: { '10^6/µL': 1, '10^12/L': 1 } },
  'white_blood_cell_count': { canonicalUnit: '10^9/L', conversionFactors: { '10^3/µL': 1, '10^9/L': 1 } },
  'platelet_count': { canonicalUnit: '10^9/L', conversionFactors: { '10^3/µL': 1, '10^9/L': 1 } },
  'mean_corpuscular_volume': { canonicalUnit: 'fL', conversionFactors: { 'fL': 1 } },
  'mean_corpuscular_hemoglobin': { canonicalUnit: 'pg', conversionFactors: { 'pg': 1 } },
  'mean_corpuscular_hemoglobin_concentration': { canonicalUnit: 'g/dL', conversionFactors: { 'g/dL': 1, 'g/L': 0.1 } },
  'red_cell_distribution_width': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'mean_platelet_volume': { canonicalUnit: 'fL', conversionFactors: { 'fL': 1 } },
  'neutrophils': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'lymphocytes': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'monocytes': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'eosinophils': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'basophils': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'immature_granulocytes': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'nucleated_red_blood_cells': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },
  'reticulocyte_count': { canonicalUnit: '%', conversionFactors: { '%': 1, 'percent': 1 } },

  // Glucose
  'fasting_plasma_glucose': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.0555, 'mmol/L': 1 } },
  'random_plasma_glucose': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.0555, 'mmol/L': 1 } },
  'postprandial_glucose': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.0555, 'mmol/L': 1 } },
  'oral_glucose_tolerance_test': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.0555, 'mmol/L': 1 } },
  'hemoglobin_a1c': { canonicalUnit: '%', conversionFactors: { '%': 1 } },
  'estimated_average_glucose': { canonicalUnit: 'mg/dL', conversionFactors: { 'mg/dL': 1, 'mmol/L': 18.018 } },

  // Kidney
  'creatinine': { canonicalUnit: 'µmol/L', conversionFactors: { 'mg/dL': 88.4, 'µmol/L': 1 } },
  'blood_urea_nitrogen': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.357, 'mmol/L': 1 } },
  'estimated_glomerular_filtration_rate': { canonicalUnit: 'mL/min/1.73m²', conversionFactors: { 'mL/min/1.73m²': 1 } },

  // Liver
  'alanine_aminotransferase': { canonicalUnit: 'U/L', conversionFactors: { 'U/L': 1 } },
  'aspartate_aminotransferase': { canonicalUnit: 'U/L', conversionFactors: { 'U/L': 1 } },
  'alkaline_phosphatase': { canonicalUnit: 'U/L', conversionFactors: { 'U/L': 1 } },
  'gamma_glutamyl_transferase': { canonicalUnit: 'U/L', conversionFactors: { 'U/L': 1 } },
  'lactate_dehydrogenase': { canonicalUnit: 'U/L', conversionFactors: { 'U/L': 1 } },
  'total_bilirubin': { canonicalUnit: 'µmol/L', conversionFactors: { 'mg/dL': 17.1, 'µmol/L': 1 } },
  'direct_bilirubin': { canonicalUnit: 'µmol/L', conversionFactors: { 'mg/dL': 17.1, 'µmol/L': 1 } },
  'total_protein': { canonicalUnit: 'g/L', conversionFactors: { 'g/dL': 10, 'g/L': 1 } },
  'albumin': { canonicalUnit: 'g/L', conversionFactors: { 'g/dL': 10, 'g/L': 1 } },
  'globulin': { canonicalUnit: 'g/L', conversionFactors: { 'g/dL': 10, 'g/L': 1 } },
  'albumin_globulin_ratio': { canonicalUnit: 'ratio', conversionFactors: { 'ratio': 1 } },
  'bilirubin': { canonicalUnit: 'µmol/L', conversionFactors: { 'mg/dL': 17.1, 'µmol/L': 1 } },

  // Lipid
  'total_cholesterol': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.02586, 'mmol/L': 1 } },
  'hdl_cholesterol': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.02586, 'mmol/L': 1 } },
  'ldl_cholesterol': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.02586, 'mmol/L': 1 } },
  'triglycerides': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.01129, 'mmol/L': 1 } },

  // Electrolytes
  'sodium': { canonicalUnit: 'mmol/L', conversionFactors: { 'mmol/L': 1, 'mEq/L': 1 } },
  'potassium': { canonicalUnit: 'mmol/L', conversionFactors: { 'mmol/L': 1, 'mEq/L': 1 } },
  'chloride': { canonicalUnit: 'mmol/L', conversionFactors: { 'mmol/L': 1, 'mEq/L': 1 } },
  'bicarbonate': { canonicalUnit: 'mmol/L', conversionFactors: { 'mmol/L': 1, 'mEq/L': 1 } },
  'calcium': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.25, 'mmol/L': 1 } },
  'ionized_calcium': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.25, 'mmol/L': 1 } },
  'magnesium': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.4114, 'mmol/L': 1 } },
  'phosphorus': { canonicalUnit: 'mmol/L', conversionFactors: { 'mg/dL': 0.323, 'mmol/L': 1 } },
  'osmolality': { canonicalUnit: 'mOsm/kg', conversionFactors: { 'mOsm/kg': 1 } },
  'anion_gap': { canonicalUnit: 'mmol/L', conversionFactors: { 'mmol/L': 1 } },

  // Vitamins
  'vitamin_b12': { canonicalUnit: 'pmol/L', conversionFactors: { 'pg/mL': 0.74, 'pmol/L': 1 } },
  'folate': { canonicalUnit: 'nmol/L', conversionFactors: { 'ng/mL': 2.266, 'nmol/L': 1 } },
  'vitamin_d_25_hydroxy': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1, 'nmol/L': 0.40 } },
  'vitamin_d_1_25_dihydroxy': { canonicalUnit: 'pg/mL', conversionFactors: { 'pg/mL': 1 } },
  'vitamin_a': { canonicalUnit: 'µg/dL', conversionFactors: { 'µg/dL': 1, 'µmol/L': 28.65 } },
  'vitamin_e': { canonicalUnit: 'mg/L', conversionFactors: { 'mg/L': 1, 'µmol/L': 0.4307 } },
  'vitamin_k': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1 } },
  'vitamin_b1': { canonicalUnit: 'nmol/L', conversionFactors: { 'nmol/L': 1 } },
  'vitamin_b6': { canonicalUnit: 'nmol/L', conversionFactors: { 'nmol/L': 1 } },
  'vitamin_c': { canonicalUnit: 'µmol/L', conversionFactors: { 'mg/dL': 56.78, 'µmol/L': 1 } },
  'biotin': { canonicalUnit: 'nmol/L', conversionFactors: { 'nmol/L': 1 } },
  'niacin': { canonicalUnit: 'nmol/L', conversionFactors: { 'nmol/L': 1 } },

  // Hormones
  'cortisol': { canonicalUnit: 'nmol/L', conversionFactors: { 'µg/dL': 27.59, 'nmol/L': 1 } },
  'adrenocorticotropic_hormone': { canonicalUnit: 'pg/mL', conversionFactors: { 'pg/mL': 1 } },
  'dehydroepiandrosterone_sulfate': { canonicalUnit: 'µg/dL', conversionFactors: { 'µg/dL': 1 } },
  'testosterone_total': { canonicalUnit: 'nmol/L', conversionFactors: { 'ng/dL': 0.0347, 'nmol/L': 1 } },
  'testosterone_free': { canonicalUnit: 'pmol/L', conversionFactors: { 'pg/mL': 3.467, 'pmol/L': 1 } },
  'estradiol': { canonicalUnit: 'pmol/L', conversionFactors: { 'pg/mL': 3.671, 'pmol/L': 1 } },
  'progesterone': { canonicalUnit: 'nmol/L', conversionFactors: { 'ng/mL': 3.18, 'nmol/L': 1 } },
  'luteinizing_hormone': { canonicalUnit: 'IU/L', conversionFactors: { 'IU/L': 1 } },
  'follicle_stimulating_hormone': { canonicalUnit: 'IU/L', conversionFactors: { 'IU/L': 1 } },
  'prolactin': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1 } },
  'anti_mullerian_hormone': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1 } },
  'insulin_like_growth_factor_1': { canonicalUnit: 'nmol/L', conversionFactors: { 'ng/mL': 0.131, 'nmol/L': 1 } },
  'beta_hydroxybutyrate': { canonicalUnit: 'mmol/L', conversionFactors: { 'mmol/L': 1 } },

  // Iron Studies
  'serum_iron': { canonicalUnit: 'µmol/L', conversionFactors: { 'µg/dL': 0.1791, 'µmol/L': 1 } },
  // Ferritin has variable molecular composition; ng/mL (equivalent to µg/L)
  // is retained rather than applying an unreliable mass-to-mole conversion.
  'ferritin': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1, 'µg/L': 1 } },
  'transferrin': { canonicalUnit: 'g/L', conversionFactors: { 'mg/dL': 0.01, 'g/L': 1 } },
  'total_iron_binding_capacity': { canonicalUnit: 'µmol/L', conversionFactors: { 'µg/dL': 0.1791, 'µmol/L': 1 } },
  'unsaturated_iron_binding_capacity': { canonicalUnit: 'µmol/L', conversionFactors: { 'µg/dL': 0.1791, 'µmol/L': 1 } },
  'transferrin_saturation': { canonicalUnit: 'ratio', conversionFactors: { 'ratio': 1 } },
  'soluble_transferrin_receptor': { canonicalUnit: 'mg/L', conversionFactors: { 'mg/L': 1 } },
  'zinc_protoporphyrin': { canonicalUnit: 'nmol/mol', conversionFactors: { 'nmol/mol': 1 } },

  // Cardiac
  'troponin_i': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1 } },
  'troponin_t': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1 } },
  'b_type_natriuretic_peptide': { canonicalUnit: 'pg/mL', conversionFactors: { 'pg/mL': 1 } },
  'n_terminal_pro_bnp': { canonicalUnit: 'pg/mL', conversionFactors: { 'pg/mL': 1 } },
  'creatine_kinase': { canonicalUnit: 'U/L', conversionFactors: { 'U/L': 1 } },
  'creatine_kinase_mb': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1 } },
  'myoglobin': { canonicalUnit: 'ng/mL', conversionFactors: { 'ng/mL': 1 } },
  'high_sensitivity_c_reactive_protein': { canonicalUnit: 'mg/L', conversionFactors: { 'mg/L': 1 } },
  'homocysteine': { canonicalUnit: 'µmol/L', conversionFactors: { 'µmol/L': 1 } },

  // Diabetes-related beyond glucose
  'fructosamine': { canonicalUnit: 'µmol/L', conversionFactors: { 'µmol/L': 1, 'nmol/L': 0.001 } },

  // General units
  'units_per_liter': { canonicalUnit: 'U/L', conversionFactors: { 'U/L': 1 } },
};

export default CANONICAL_UNITS;
