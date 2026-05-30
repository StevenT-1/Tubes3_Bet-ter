import { searchBoyerMoore } from "../algorithms/boyerMoore";
import { searchKMP } from "../algorithms/kmp";
import { searchRabinKarp } from "../algorithms/rabinKarp";
import { searchRegex } from "../algorithms/regex";
import { searchWeightedLevenshtein } from "../algorithms/weightedLevenshtein";
import type { AlgorithmResult, MatchSource } from "../algorithms/types";

export type TextAlgorithmOptions = {
  runRabinKarp: boolean;
};

export function runTextAlgorithms(
  text: string,
  keywords: string[],
  sourceType: MatchSource,
  caseInsensitive: boolean,
  options: TextAlgorithmOptions,
): AlgorithmResult[] {
  const results: AlgorithmResult[] = [
    searchKMP(keywords, text, sourceType, caseInsensitive),
    searchBoyerMoore(keywords, text, sourceType, caseInsensitive),
    searchRegex(keywords, text, sourceType, caseInsensitive),
    searchWeightedLevenshtein(keywords, text, sourceType, caseInsensitive),
  ];

  if (options.runRabinKarp) {
    results.push(searchRabinKarp(keywords, text, sourceType, caseInsensitive));
  }

  return results;
}