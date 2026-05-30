import type { AlgorithmResult } from "../algorithms/types";
import type { AlgorithmResultSummary } from "../shared/messages";
import {
  DEFAULT_SCAN_SETTINGS,
  type ScanResponse,
  type ScanSettings,
  type ScanSuccessResponse,
} from "../shared/messages";
import { collectTextNodes, reachedTextNodeLimit } from "./domScanner";
import { markTextMatches, clearTextMarks } from "./textMarker";
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

  clearTextMarks();

  const textNodes = collectTextNodes(document.body);

  if (reachedTextNodeLimit(textNodes)) {
    warnings.push("Large page detected; scan limited to visible text.");
  }

  const scanText = textNodes.map((entry) => entry.text).join("\n");
  const algorithms = runTextAlgorithms(
    scanText,
    keywords,
    "dom-text",
    true,
  );
  const detectionResults: AlgorithmResult[] = [];
  const primaryTextDetectionResult = selectPrimaryDetectionResult(algorithms);

  if (primaryTextDetectionResult) {
    detectionResults.push(primaryTextDetectionResult);
  }

  if (normalizedSettings.highlight || normalizedSettings.blurText) {
    markTextMatches(textNodes, keywords, normalizedSettings);
  }

  if (normalizedSettings.ocr) {
    warnings.push("OCR image detection is not implemented yet.");
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

function summarizeAlgorithms(results: AlgorithmResult[]): AlgorithmResultSummary[] {
  return results.map((result) => ({
    algorithm: result.algorithm,
    source: result.source,
    matches: result.matches.length,
    executionTimeMs: result.executionTimeMs,
    comparisonCount: result.comparisonCount,
  }));
}

function selectPrimaryDetectionResult(
  results: AlgorithmResult[],
  source?: AlgorithmResult["source"],
): AlgorithmResult | undefined {
  const sourceResults = source
    ? results.filter((result) => result.source === source)
    : results;

  return sourceResults.find((result) => result.algorithm === "KMP") ?? sourceResults[0];
}

function normalizeSettings(settings: Partial<ScanSettings> | undefined): ScanSettings {
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
    fuzzyThreshold:
      typeof settings?.fuzzyThreshold === "number"
        ? Math.min(1, Math.max(0, settings.fuzzyThreshold))
        : DEFAULT_SCAN_SETTINGS.fuzzyThreshold,
  };
}
