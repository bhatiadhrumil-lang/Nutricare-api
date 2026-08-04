/**
 * Configurable clinical domain weights for calculating overall health score.
 * Domains with higher clinical acuity (e.g. Cardiac, Kidney, Electrolytes)
 * carry higher weighting than standard wellness markers.
 */
export const DOMAIN_WEIGHTS = Object.freeze({
  CBC: 1.2,
  Kidney: 1.5,
  Liver: 1.2,
  Diabetes: 1.5,
  Lipids: 1.0,
  Thyroid: 1.0,
  Electrolytes: 1.5,
  Vitamins: 0.8,
  Inflammation: 1.3,
  Cardiac: 1.8,
});

export default DOMAIN_WEIGHTS;
