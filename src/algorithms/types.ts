export type MatchAlgorithm =
  | "KMP"
  | "Boyer-Moore"
  | "Regex"
  | "Weighted-Levenshtein"
  | "Rabin-Karp"
  | "Aho-Corasick";

export type MatchSource =
  | "dom-text"
  | "image-ocr";

export interface MatchResult {
  keyword: string;
  matchedText: string;

  startIndex?: number;
  endIndex?: number;

  distance?: number;
  similarity?: number;
}

export interface AlgorithmResult {
  matches: MatchResult[];
  executionTimeMs: number;
  comparisonCount: number;

  algorithm: MatchAlgorithm;
  source: MatchSource;
}
