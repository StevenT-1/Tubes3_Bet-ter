import type { AlgorithmResult } from "../algorithms/types";

export interface MatchSummary {
    totalMatches: number,
    matchesByAlgorithm: Record<string, number>,
    executionTimeByAlgorithm: Record<string, number>,
    comparisonCountByAlgorithm: Record<string, number>,
    keywordCounts: Record<string, number>;
}

export function summarizeAlgorithmResults(results: AlgorithmResult[]): MatchSummary {
    const summary: MatchSummary = {
        totalMatches: 0,
        matchesByAlgorithm: {},
        executionTimeByAlgorithm: {},
        comparisonCountByAlgorithm: {},
        keywordCounts: {}
    }

    for (const result of results) {
        summary.totalMatches += result.matches.length;

        summary.matchesByAlgorithm[result.algorithm] = 
            (summary.matchesByAlgorithm[result.algorithm] ?? 0) + result.matches.length;

        summary.executionTimeByAlgorithm[result.algorithm] =
            (summary.executionTimeByAlgorithm[result.algorithm] ?? 0) + result.executionTimeMs;

        summary.comparisonCountByAlgorithm[result.algorithm] =
            (summary.comparisonCountByAlgorithm[result.algorithm] ?? 0) + result.comparisonCount;

        for (const match of result.matches) {
            summary.keywordCounts[match.keyword] =
                (summary.keywordCounts[match.keyword] ?? 0) + 1;
        }
    }

    return summary;
}