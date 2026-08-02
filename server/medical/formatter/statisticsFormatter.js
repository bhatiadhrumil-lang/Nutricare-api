/** Reuses pipeline metrics without recalculating extraction statistics. */
export function formatStatistics(pipelineStatistics = {}) {
  return { ...pipelineStatistics };
}

export default formatStatistics;
