export const NUMBER_PATTERN = '[+-]?(?:\\d+(?:[.,]\\d+)?|[.,]\\d+)';
export const RANGE_PATTERN = new RegExp(`^\\s*(?<low>${NUMBER_PATTERN})\\s*(?:-|–|—|~|to)\\s*(?<high>${NUMBER_PATTERN})(?:\\s*(?<unit>[^;,:]+?))?\\s*$`, 'iu');
export const LIMIT_PATTERN = new RegExp(`^\\s*(?<operator><=|>=|≤|≥|<|>)\\s*(?<value>${NUMBER_PATTERN})(?:\\s*(?<unit>[^;,:]+?))?\\s*$`, 'u');
export const DEMOGRAPHIC_LABEL_PATTERN = /\\b(?<label>male|female|infant|child(?:ren)?|adult|trimester\\s*[123]|first|second|third\\s+trimester|pregnan(?:cy|t))\\b/iu;

export const QUALITATIVE_VALUES = Object.freeze([
  ['not detected', 'not_detected'], ['non reactive', 'non_reactive'],
  ['negative', 'negative'], ['positive', 'positive'], ['reactive', 'reactive'],
  ['detected', 'detected'], ['trace', 'trace'], ['present', 'present'], ['absent', 'absent'],
]);

export const RISK_VALUES = Object.freeze([
  ['low risk', 'low_risk'], ['intermediate', 'intermediate'], ['high risk', 'high_risk'],
]);
