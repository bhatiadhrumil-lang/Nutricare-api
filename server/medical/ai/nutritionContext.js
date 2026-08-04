/**
 * Extracts and maps laboratory parameters to specific nutrient insights
 * for targeted dietary and nutritional recommendations.
 */
export const NUTRIENT_PARAMETER_MAP = Object.freeze({
  Iron: ['ferritin', 'serum_iron', 'hemoglobin'],
  'Vitamin D': ['vitamin_d_25_hydroxy', 'vitamin_d_1_25_dihydroxy'],
  'Vitamin B12': ['vitamin_b12'],
  Folate: ['folate'],
  Protein: ['total_protein', 'albumin'],
  Albumin: ['albumin'],
  Calcium: ['calcium', 'ionized_calcium'],
  Magnesium: ['magnesium'],
  Potassium: ['potassium'],
  Sodium: ['sodium'],
  Zinc: ['zinc_protoporphyrin'],
  Ferritin: ['ferritin'],
  Glucose: ['fasting_plasma_glucose', 'random_plasma_glucose', 'postprandial_glucose'],
  HbA1c: ['hemoglobin_a1c'],
});

function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

export function extractNutritionContext(parameters = []) {
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
      if (paramMap.has(pKey)) {
        const p = paramMap.get(pKey);
        relevant.push({
          parameter: pKey,
          value: p.value ?? p.normalizedValue,
          status: p.status ?? 'UNKNOWN',
          severity: p.severity ?? 'NORMAL',
        });
      }
    }

    if (relevant.length > 0) {
      const hasAbnormal = relevant.some((r) => r.status !== 'NORMAL' && r.status !== 'UNKNOWN');
      nutrientStatus[nutrientName] = {
        relevantParameters: relevant,
        requiresNutritionalFocus: hasAbnormal,
      };
    }
  }

  return nutrientStatus;
}

export default extractNutritionContext;
