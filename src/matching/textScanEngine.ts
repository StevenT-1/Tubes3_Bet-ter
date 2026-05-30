import { searchBoyerMoore } from "../algorithms/boyerMoore";
import { searchKMP } from "../algorithms/kmp";
import { searchRabinKarp } from "../algorithms/rabinKarp";
import { searchRegex } from "../algorithms/regex";
import type { AlgorithmResult, MatchSource } from "../algorithms/types";

export function runTextAlgorithms(
  text: string,
  keywords: string[],
  sourceType: MatchSource,
  caseInsensitive: boolean,
): AlgorithmResult[] {
  return [
    searchKMP(keywords, text, sourceType, caseInsensitive),
    searchBoyerMoore(keywords, text, sourceType, caseInsensitive),
    searchRegex(keywords, text, sourceType, caseInsensitive),
    searchRabinKarp(keywords, text, sourceType, caseInsensitive),
  ];
}
