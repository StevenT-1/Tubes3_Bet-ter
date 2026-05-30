import type { AlgorithmResult } from "../algorithms/types";
import type { AlgorithmResultSummary } from "../shared/messages";
import {
  DEFAULT_SCAN_SETTINGS,
  type ScanResponse,
  type ScanSettings,
  type ScanSuccessResponse,
} from "../shared/messages";
import { collectTextNodes, reachedTextNodeLimit } from "./domScanner";
import {
  markTextMatches,
  clearTextMarks,
  type TextMatchAnnotation,
} from "./textMarker";
import { blurOcrImages, clearOcrImageMarks } from "../ocr/imageScanner";
import { scanImagesWithOcr } from "../ocr/ocrScanner";
import { loadKeywords } from "../matching/keywordLoader";
import {
  buildStatistics,
  countTotalMatches,
} from "../matching/statisticsBuilder";
import { runTextAlgorithms } from "../matching/textScanEngine";

export async function scanPage(settings: ScanSettings): Promise<ScanResponse> {
  const scanStartedAt = performance.now();
  const normalizedSettings = normalizeSettings(settings);
  const warnings: string[] = [];
  const keywords = await loadKeywords();
  const algorithmOptions = {
    runRabinKarp: normalizedSettings.runRabinKarp,
    runAhoCorasick: normalizedSettings.runAhoCorasick,
    fuzzyThreshold: normalizedSettings.fuzzyThreshold,
  };

  clearTextMarks();
  clearOcrImageMarks();

  const textNodes = collectTextNodes(document.body);

  if (reachedTextNodeLimit(textNodes)) {
    warnings.push("Large page detected; scan limited to the first scannable text nodes.");
  }

  const scanText = textNodes.map((entry) => entry.text).join("\n");
  const algorithms = runTextAlgorithms(
    scanText,
    keywords,
    "dom-text",
    true,
    algorithmOptions,
  );
  const detectionResults: AlgorithmResult[] = [
    ...selectDetectionResults(algorithms, "dom-text"),
  ];

  if (normalizedSettings.highlight || normalizedSettings.blurText) {
    markTextMatches(
      textNodes,
      buildTextMatchAnnotations(algorithms, "dom-text"),
      normalizedSettings,
    );
  }

  if (normalizedSettings.ocr) {
    try {
      const ocrResult = await scanImagesWithOcr(keywords, algorithmOptions);

      algorithms.push(...ocrResult.algorithmResults);
      warnings.push(...ocrResult.warnings);
      detectionResults.push(
        ...selectDetectionResults(ocrResult.algorithmResults, "image-ocr"),
      );

      if (normalizedSettings.blurText) {
        blurOcrImages(ocrResult.detectedImages);
      }
    } catch (error) {
      warnings.push(`OCR scan failed: ${friendlyError(error)}`);
    }
  }

  const statistics = buildStatistics(detectionResults);

  return {
    ok: true,
    url: window.location.href,
    title: document.title,
    scannedAt: Date.now(),
    loadedKeywordCount: keywords.length,
    matchedKeywordCount: statistics.length,
    totalMatches: countTotalMatches(detectionResults),
    totalExecutionTimeMs: performance.now() - scanStartedAt,
    algorithms: summarizeAlgorithms(algorithms),
    statistics,
    warnings,
  } satisfies ScanSuccessResponse;
}

function summarizeAlgorithms(
  results: AlgorithmResult[],
): AlgorithmResultSummary[] {
  return results.map((result) => ({
    algorithm: result.algorithm,
    source: result.source,
    matches: result.matches.length,
    executionTimeMs: result.executionTimeMs,
    comparisonCount: result.comparisonCount,
  }));
}

function selectDetectionResults(
  results: AlgorithmResult[],
  source?: AlgorithmResult["source"],
): AlgorithmResult[] {
  const sourceResults = source
    ? results.filter((result) => result.source === source)
    : results;

  const primaryExactResult =
    findResultWithMatches(sourceResults, "KMP") ??
    findResultWithMatches(sourceResults, "Boyer-Moore");

  const regexResult = findResultWithMatches(sourceResults, "Regex");
  const fuzzyResult = findResultWithMatches(sourceResults, "Weighted-Levenshtein");

  return [primaryExactResult, regexResult, fuzzyResult].filter(
    (result): result is AlgorithmResult => Boolean(result),
  );
}

function findResultWithMatches(
  results: AlgorithmResult[],
  algorithm: AlgorithmResult["algorithm"],
): AlgorithmResult | undefined {
  return results.find(
    (result) => result.algorithm === algorithm && result.matches.length > 0,
  );
}

function buildTextMatchAnnotations(
  results: AlgorithmResult[],
  source?: AlgorithmResult["source"],
): TextMatchAnnotation[] {
  const sourceResults = source
    ? results.filter((result) => result.source === source)
    : results;

  return sourceResults.flatMap((result) => {
    const countsByKeyword = countMatchesByKeyword(result);

    return result.matches.flatMap((match) => {
      if (
        typeof match.startIndex !== "number" ||
        typeof match.endIndex !== "number" ||
        match.endIndex < match.startIndex
      ) {
        return [];
      }

      return [
        {
          start: match.startIndex,
          end: match.endIndex + 1,
          keyword: match.keyword,
          matchedText: match.matchedText,
          algorithm: result.algorithm,
          source: result.source,
          count: countsByKeyword.get(match.keyword) ?? 1,
          executionTimeMs: result.executionTimeMs,
        },
      ];
    });
  });
}

function countMatchesByKeyword(result: AlgorithmResult): Map<string, number> {
  const counts = new Map<string, number>();

  for (const match of result.matches) {
    counts.set(match.keyword, (counts.get(match.keyword) ?? 0) + 1);
  }

  return counts;
}

function friendlyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function normalizeSettings(
  settings: Partial<ScanSettings> | undefined,
): ScanSettings {
  return {
    highlight:
      typeof settings?.highlight === "boolean"
        ? settings.highlight
        : DEFAULT_SCAN_SETTINGS.highlight,
    blurText:
      typeof settings?.blurText === "boolean"
        ? settings.blurText
        : DEFAULT_SCAN_SETTINGS.blurText,
    ocr:
      typeof settings?.ocr === "boolean"
        ? settings.ocr
        : DEFAULT_SCAN_SETTINGS.ocr,
    runRabinKarp:
      typeof settings?.runRabinKarp === "boolean"
        ? settings.runRabinKarp
        : DEFAULT_SCAN_SETTINGS.runRabinKarp,
    runAhoCorasick:
      typeof settings?.runAhoCorasick === "boolean"
        ? settings.runAhoCorasick
        : DEFAULT_SCAN_SETTINGS.runAhoCorasick,
    fuzzyThreshold:
      typeof settings?.fuzzyThreshold === "number"
        ? Math.min(0.95, Math.max(0.5, settings.fuzzyThreshold))
        : DEFAULT_SCAN_SETTINGS.fuzzyThreshold,
  };
}
