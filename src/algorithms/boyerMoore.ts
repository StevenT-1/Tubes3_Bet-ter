import type { AlgorithmResult, MatchResult, MatchSource } from "./types";

export function searchBoyerMoore(
  keywords: string[],
  text: string,
  sourceType: MatchSource,
  caseInsensitive: boolean,
): AlgorithmResult {
  const startTime = performance.now();
  const matches: MatchResult[] = [];
  let comparisonCount = 0;
  const searchableText = caseInsensitive ? text.toLowerCase() : text;

  for (const keyword of keywords) {
    const searchableKeyword = caseInsensitive ? keyword.toLowerCase() : keyword;
    const result = searchKeyword(text, searchableText, searchableKeyword);

    matches.push(...result.matches);
    comparisonCount += result.comparisonCount;
  }

  return {
    matches,
    executionTimeMs: performance.now() - startTime,
    comparisonCount,
    algorithm: "Boyer-Moore",
    source: sourceType,
  };
}

function searchKeyword(
  originalText: string,
  searchableText: string,
  searchableKeyword: string,
): { matches: MatchResult[]; comparisonCount: number } {
  const matches: MatchResult[] = [];
  const keywordLength = searchableKeyword.length;
  let comparisonCount = 0;

  if (keywordLength === 0 || keywordLength > searchableText.length) {
    return { matches, comparisonCount };
  }

  const lastOccurrence = buildLastOccurrenceTable(searchableKeyword);
  let shift = 0;

  while (shift <= searchableText.length - keywordLength) {
    let keywordIndex = keywordLength - 1;

    while (keywordIndex >= 0) {
      comparisonCount += 1;

      if (
        searchableKeyword.charAt(keywordIndex) !==
        searchableText.charAt(shift + keywordIndex)
      ) {
        break;
      }

      keywordIndex -= 1;
    }

    if (keywordIndex < 0) {
      matches.push({
        keyword: searchableKeyword,
        matchedText: originalText.slice(shift, shift + keywordLength),
        startIndex: shift,
        endIndex: shift + keywordLength - 1,
      });
      shift += 1;
      continue;
    }

    const badCharacter = searchableText.charAt(shift + keywordIndex);
    const badCharacterLastIndex = lastOccurrence.get(badCharacter) ?? -1;
    shift += Math.max(1, keywordIndex - badCharacterLastIndex);
  }

  return { matches, comparisonCount };
}

function buildLastOccurrenceTable(keyword: string): Map<string, number> {
  const table = new Map<string, number>();

  for (let index = 0; index < keyword.length; index += 1) {
    table.set(keyword.charAt(index), index);
  }

  return table;
}
