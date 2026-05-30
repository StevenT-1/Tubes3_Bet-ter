import { searchKMP } from "../algorithms/kmp";
import { searchRabinKarp } from "../algorithms/rabinKarp";
import type { AlgorithmResult, MatchSource } from "../algorithms/types";

export function runTextAlgorithms(
  text: string,
  keywords: string[],
  sourceType: MatchSource,
  caseInsensitive: boolean,
): AlgorithmResult[] {
  return [
    searchKMP(keywords, text, sourceType, caseInsensitive),
    searchRabinKarp(keywords, text, sourceType, caseInsensitive),
  ];
}
