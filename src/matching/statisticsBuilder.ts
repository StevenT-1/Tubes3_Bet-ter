import type { AlgorithmResult } from "../algorithms/types";
import type { StatisticChartRow, StatisticDetailRow } from "../shared/messages";

export function buildStatistics(results: AlgorithmResult[]): StatisticChartRow[] {
  const byKeyword = new Map<string, StatisticDetailRow[]>();

  for (const result of results) {
    const matchCounts = new Map<string, number>();

    for (const match of result.matches) {
      const keyword = match.keyword;
      matchCounts.set(keyword, (matchCounts.get(keyword) ?? 0) + 1);
    }

    for (const [keyword, count] of matchCounts) {
      const details = byKeyword.get(keyword) ?? [];
      details.push({
        source: result.algorithm,
        type: result.source === "dom-text" ? "Text" : "OCR",
        count,
      });
      byKeyword.set(keyword, details);
    }
  }

  return [...byKeyword.entries()]
    .map(([keyword, details]) => ({
      keyword,
      value: details.reduce((total, detail) => total + detail.count, 0),
      details,
    }))
    .sort((first, second) => second.value - first.value || first.keyword.localeCompare(second.keyword))
    .slice(0, 24);
}

export function countTotalMatches(results: AlgorithmResult[]): number {
  return results.reduce((total, result) => total + result.matches.length, 0);
}

export function sumExecutionTime(results: AlgorithmResult[]): number {
  return results.reduce((total, result) => total + result.executionTimeMs, 0);
}
