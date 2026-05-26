import { MatchResult } from './types';
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
  algorithm: MatchAlgorithm;
  source: MatchSource;

  startIndex?: number;
  endIndex?: number;

  executionTimeMs: number;
  comparisonCount?: number;

  distance?: number;
  similarity?: number;
}

export function matchResultGenerator(){}