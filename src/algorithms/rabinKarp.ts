import type { AlgorithmResult, MatchResult, MatchSource } from "./types";

const BASE = 31;
const MOD = 1_000_000_007;

export function searchRabinKarp(
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
    const result = searchKeyword(text, searchableText, keyword, searchableKeyword);

    matches.push(...result.matches);
    comparisonCount += result.comparisonCount;
  }

  return {
    matches,
    executionTimeMs: performance.now() - startTime,
    comparisonCount,
    algorithm: "Rabin-Karp",
    source: sourceType,
  };
}

function searchKeyword(
  originalText: string,
  searchableText: string,
  originalKeyword: string,
  searchableKeyword: string,
): { matches: MatchResult[]; comparisonCount: number } {
  const matches: MatchResult[] = [];
  const keywordLength = searchableKeyword.length;

  if (keywordLength === 0 || keywordLength > searchableText.length) {
    return { matches, comparisonCount: 0 };
  }

  const keywordHash = computeHash(searchableKeyword, 0, keywordLength);
  let windowHash = computeHash(searchableText, 0, keywordLength);
  const highestPower = computePower(BASE, keywordLength - 1);
  let comparisonCount = 0;

  for (let index = 0; index <= searchableText.length - keywordLength; index += 1) {
    if (index > 0) {
      windowHash = rollHash(
        windowHash,
        highestPower,
        searchableText.charCodeAt(index - 1),
        searchableText.charCodeAt(index + keywordLength - 1),
      );
    }

    if (windowHash !== keywordHash) {
      continue;
    }

    const verification = verifyMatch(searchableText, searchableKeyword, index);
    comparisonCount += verification.comparisonCount;

    if (verification.isMatch) {
      matches.push({
        keyword: originalKeyword,
        matchedText: originalText.slice(index, index + keywordLength),
        startIndex: index,
        endIndex: index + keywordLength - 1,
      });
    }
  }

  return { matches, comparisonCount };
}

function verifyMatch(
  text: string,
  keyword: string,
  startIndex: number,
): { isMatch: boolean; comparisonCount: number } {
  let comparisonCount = 0;

  for (let index = 0; index < keyword.length; index += 1) {
    comparisonCount += 1;

    if (text.charAt(startIndex + index) !== keyword.charAt(index)) {
      return { isMatch: false, comparisonCount };
    }
  }

  return { isMatch: true, comparisonCount };
}

function computeHash(text: string, start: number, end: number): number {
  let hashValue = 0;

  for (let index = start; index < end; index += 1) {
    hashValue = (hashValue * BASE + text.charCodeAt(index)) % MOD;
  }

  return hashValue;
}

function computePower(base: number, power: number): number {
  let result = 1;

  for (let index = 0; index < power; index += 1) {
    result = (result * base) % MOD;
  }

  return result;
}

function rollHash(
  hashValue: number,
  highestPower: number,
  oldCharCode: number,
  newCharCode: number,
): number {
  const withoutOldChar = (hashValue - oldCharCode * highestPower) % MOD;
  const normalizedHash = (withoutOldChar + MOD) % MOD;

  return (normalizedHash * BASE + newCharCode) % MOD;
}
