import type { AlgorithmResult, MatchResult, MatchSource } from "./types";

const JUDOL_TOKEN_PATTERN =
  "(^|[^\\p{L}\\p{N}])(\\p{L}+[0-9]{2,})(?=$|[^\\p{L}\\p{N}])";

export function searchRegex(
  _keywords: string[],
  text: string,
  sourceType: MatchSource,
  caseInsensitive: boolean,
): AlgorithmResult {
  const startTime = performance.now();
  const matches: MatchResult[] = [];
  const regex = new RegExp(
    JUDOL_TOKEN_PATTERN,
    `gu${caseInsensitive ? "i" : ""}`,
  );
  let comparisonCount = 0;
  let result: RegExpExecArray | null;

  while ((result = regex.exec(text)) !== null) {
    const prefix = result[1] ?? "";
    const matchedText = result[2] ?? "";
    const startIndex = result.index + prefix.length;
    const keyword = caseInsensitive ? matchedText.toLowerCase() : matchedText;

    if (!matchedText) {
      continue;
    }

    comparisonCount += 1;
    matches.push({
      keyword,
      matchedText,
      startIndex,
      endIndex: startIndex + matchedText.length - 1,
    });
  }

  return {
    matches,
    executionTimeMs: performance.now() - startTime,
    comparisonCount,
    algorithm: "Regex",
    source: sourceType,
  };
}
