/**
 * nutritionContext.js
 * Maps laboratory parameters to nutritional insights for targeted dietary
 * and supplementation recommendations in the Claude prompt.
 *
 * Only nutrients with at least one corresponding parameter in the report
 * are included, keeping the context token-efficient.
 */

/**
 * Canonical map of nutrition-relevant biomarker IDs per nutrient.
 * Keys are nutrient display names; values are arrays of pipeline parameter IDs.
 */
export const NUTRIENT_PARAMETER_MAP = Object.freeze({
  Iron: ['ferritin', 'serum_iron', 'hemoglobin', 'mean_corpuscular_hemoglobin', 'mean_corpuscular_hemoglobin_concentration'],
  'Vitamin D': ['vitamin_d_25_hydroxy', 'vitamin_d_1_25_dihydroxy'],
  'Vitamin B12': ['vitamin_b12', 'cobalamin'],
  Folate: ['folate', 'folic_acid', 'red_blood_cell_folate'],
  Protein: ['total_protein', 'albumin', 'globulin'],
  Albumin: ['albumin'],
  Calcium: ['calcium', 'ionized_calcium', 'corrected_calcium'],
  Magnesium: ['magnesium'],
  Potassium: ['potassium'],
  Sodium: ['sodium'],
  Zinc: ['zinc_protoporphyrin', 'zinc'],
  Ferritin: ['ferritin'],
  Glucose: ['fasting_plasma_glucose', 'random_plasma_glucose', 'postprandial_glucose', 'two_hour_plasma_glucose'],
  HbA1c: ['hemoglobin_a1c'],
});

/**
 * Dietary implication lookup — maps nutrient name to a concise implication string
 * that Claude can use to frame its nutrition recommendation.
 */
const DIETARY_IMPLICATION = Object.freeze({
  Iron: 'Consider iron-rich foods (red meat, lentils, spinach) and Vitamin C co-ingestion to enhance absorption.',
  'Vitamin D': 'Consider sunlight exposure, fatty fish, fortified dairy, or supplementation under medical guidance.',
  'Vitamin B12': 'Consider animal-derived foods, fortified cereals, or B12 supplementation especially for vegetarians.',
  Folate: 'Consider folate-rich foods: leafy greens, legumes, fortified grains.',
  Protein: 'Consider adequate intake of complete protein sources: eggs, dairy, lean meat, or plant combinations (rice + legumes).',
  Albumin: 'Low albumin may reflect malnutrition or liver dysfunction — medical review is recommended.',
  Calcium: 'Consider dairy, fortified plant milks, almonds, and leafy greens for calcium; Vitamin D supports absorption.',
  Magnesium: 'Consider magnesium-rich foods: nuts, seeds, whole grains, dark chocolate.',
  Potassium: 'Consider potassium-rich foods: bananas, sweet potatoes, avocados, beans. Monitor if on cardiac mediation.',
  Sodium: 'Monitor sodium intake. High sodium is linked to hypertension risk.',
  Zinc: 'Consider zinc-rich foods: meat, shellfish, legumes, seeds.',
  Ferritin: 'Ferritin reflects iron stores. Consider iron-rich foods; avoid tea/coffee with meals if low.',
  Glucose: 'Consider low-glycemic foods, reduce simple sugars and refined carbohydrates.',
  HbA1c: 'HbA1c reflects 2-3 month average blood glucose. Consistent dietary carbohydrate control is important.',
});

/**
 * Returns the canonical lookup key for a parameter item.
 * @param {object} item
 * @returns {string|null}
 */
function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

/**
 * Classifies the nutritional relevance of a parameter status.
 * @param {string} status
 * @returns {'DEFICIENT'|'EXCESS'|'NORMAL'|'UNKNOWN'}
 */
function nutritionalRelevance(status) {
  if (!status || status === 'UNKNOWN') return 'UNKNOWN';
  if (status === 'NORMAL') return 'NORMAL';
  if (status.endsWith('_LOW') || status === 'LOW') return 'DEFICIENT';
  if (status.endsWith('_HIGH') || status === 'HIGH') return 'EXCESS';
  return 'UNKNOWN';
}

/**
 * Builds the nutritionContext section for the AI context.
 * Only nutrients with at least one observed parameter in the report are included.
 * Nutrients with all-normal parameters are included but marked as not requiring focus,
 * allowing Claude to confirm adequate nutritional status.
 *
 * @param {Array} parameters - Enriched pipeline parameter array
 * @returns {object} Nutrient-keyed object with relevantParameters, status summary, and dietary implication
 */
export function extractNutritionContext(parameters = []) {
  // Build a fast lookup map by parameter ID
  const paramMap = new Map();
  for (const item of parameters) {
    const key = getParamKey(item);
    if (key) {
      paramMap.set(key, item);
    }
  }

  const nutrientStatus = {};

  for (const [nutrientName, paramKeys] of Object.entries(NUTRIENT_PARAMETER_MAP)) {
    const relevant = [];

    for (const pKey of paramKeys) {
      if (!paramMap.has(pKey)) continue;

      const p = paramMap.get(pKey);
      const status = p.status ?? 'UNKNOWN';
      const val = p.normalizedValue ?? p.value;
      const unit = p.normalizedUnit ?? p.unit ?? null;
      const displayValue = val !== null && val !== undefined
        ? (unit ? `${val} ${unit}` : String(val))
        : 'N/A';

      relevant.push({
        parameter: pKey,
        value: displayValue,
        status,
        severity: p.severity ?? 'NORMAL',
        nutritionalRelevance: nutritionalRelevance(status),
      });
    }

    // Only include nutrients for which we have at least one matching parameter
    if (relevant.length === 0) continue;

    const hasAbnormal = relevant.some((r) => r.nutritionalRelevance !== 'NORMAL' && r.nutritionalRelevance !== 'UNKNOWN');
    const hasDeficiency = relevant.some((r) => r.nutritionalRelevance === 'DEFICIENT');
    const hasExcess = relevant.some((r) => r.nutritionalRelevance === 'EXCESS');

    // Derive an aggregate nutritional status for each nutrient
    let overallNutritionalStatus;
    if (hasDeficiency) {
      overallNutritionalStatus = 'DEFICIENT';
    } else if (hasExcess) {
      overallNutritionalStatus = 'EXCESS';
    } else if (relevant.every((r) => r.nutritionalRelevance === 'NORMAL')) {
      overallNutritionalStatus = 'ADEQUATE';
    } else {
      overallNutritionalStatus = 'UNKNOWN';
    }

    nutrientStatus[nutrientName] = {
      overallStatus: overallNutritionalStatus,
      requiresNutritionalFocus: hasAbnormal,
      relevantParameters: relevant,
      dietaryImplication: hasAbnormal ? (DIETARY_IMPLICATION[nutrientName] ?? null) : null,
    };
  }

  return nutrientStatus;
}

export default extractNutritionContext;
