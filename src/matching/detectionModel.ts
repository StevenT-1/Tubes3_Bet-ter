import type { AlgorithmResult, MatchAlgorithm } from "../algorithms/types";

export type DetectionAlgorithm =
  | "KMP"
  | "BM"
  | "Regex"
  | "WeightedLevenshtein"
  | "RabinKarp"
  | "AhoCorasick";

export type Detection = {
  id: string;
  textNodeId: string;
  keyword: string;
  matchedText: string;
  start: number;
  end: number;
  algorithms: DetectionAlgorithm[];
  occurrenceCountInTextNode: number;
  executionTimeMs: number;
  comparisonCount?: number;
  distance?: number;
  score?: number;
};

export type HighlightRange = {
  start: number;
  end: number;
  detections: Detection[];
};

type MutableDetection = Omit<
  Detection,
  "algorithms" | "occurrenceCountInTextNode"
> & {
  algorithms: Set<DetectionAlgorithm>;
  occurrenceCountInTextNode: number;
};

export function buildDetectionsForTextNode(
  textNodeId: string,
  results: AlgorithmResult[],
): Detection[] {
  const mergedDetections = new Map<string, MutableDetection>();

  for (const result of results) {
    const algorithm = toDetectionAlgorithm(result.algorithm);

    for (const match of result.matches) {
      if (
        typeof match.startIndex !== "number" ||
        typeof match.endIndex !== "number" ||
        match.endIndex < match.startIndex
      ) {
        continue;
      }

      const start = match.startIndex;
      const end = match.endIndex + 1;
      const keyword = match.keyword || match.matchedText;
      const matchedText = match.matchedText;
      const key = createMergeKey(textNodeId, start, end, keyword, matchedText);
      const existingDetection = mergedDetections.get(key);

      if (existingDetection) {
        existingDetection.algorithms.add(algorithm);
        existingDetection.executionTimeMs += result.executionTimeMs;
        existingDetection.comparisonCount =
          (existingDetection.comparisonCount ?? 0) + result.comparisonCount;
        continue;
      }

      mergedDetections.set(key, {
        id: `judol-${textNodeId}-${start}-${end}-${mergedDetections.size}`,
        textNodeId,
        keyword,
        matchedText,
        start,
        end,
        algorithms: new Set([algorithm]),
        occurrenceCountInTextNode: 1,
        executionTimeMs: result.executionTimeMs,
        comparisonCount: result.comparisonCount,
        distance: match.distance,
        score: match.similarity,
      });
    }
  }

  const detections = [...mergedDetections.values()].map(toDetection);
  const occurrenceCounts = new Map<string, number>();

  for (const detection of detections) {
    const key = `${detection.textNodeId}\u0000${detection.keyword}`;
    occurrenceCounts.set(key, (occurrenceCounts.get(key) ?? 0) + 1);
  }

  for (const detection of detections) {
    const key = `${detection.textNodeId}\u0000${detection.keyword}`;
    detection.occurrenceCountInTextNode = occurrenceCounts.get(key) ?? 1;
  }

  return detections.sort((first, second) => {
    return first.start - second.start || second.end - first.end;
  });
}

export function buildHighlightRanges(detections: Detection[]): HighlightRange[] {
  const ranges: HighlightRange[] = [];

  for (const detection of detections) {
    const lastRange = ranges[ranges.length - 1];

    if (!lastRange || detection.start >= lastRange.end) {
      ranges.push({
        start: detection.start,
        end: detection.end,
        detections: [detection],
      });
      continue;
    }

    if (detection.end > lastRange.end) {
      lastRange.end = detection.end;
    }

    lastRange.detections.push(detection);
  }

  return ranges;
}

export function formatTooltipDetections(detections: Detection[]): string {
  const lines = ["Detected:"];

  for (const detection of detections) {
    const label = isRegexDetection(detection)
      ? "Keyword/Pattern"
      : "Keyword";

    lines.push(
      `- ${label}: ${detection.keyword}`,
      `  Matched text: ${detection.matchedText}`,
      `  Algorithms: ${detection.algorithms.join(", ")}`,
      `  Occurrences in this text node: ${detection.occurrenceCountInTextNode}`,
      `  Execution time: ${formatMs(detection.executionTimeMs)}`,
    );
  }

  return lines.join("\n");
}

function toDetectionAlgorithm(algorithm: MatchAlgorithm): DetectionAlgorithm {
  switch (algorithm) {
    case "Boyer-Moore":
      return "BM";
    case "Weighted-Levenshtein":
      return "WeightedLevenshtein";
    case "Rabin-Karp":
      return "RabinKarp";
    case "Aho-Corasick":
      return "AhoCorasick";
    default:
      return algorithm;
  }
}

function toDetection(detection: MutableDetection): Detection {
  return {
    ...detection,
    algorithms: [...detection.algorithms],
  };
}

function isRegexDetection(detection: Detection): boolean {
  return detection.algorithms.some((algorithm) => algorithm === "Regex");
}

function createMergeKey(
  textNodeId: string,
  start: number,
  end: number,
  keyword: string,
  matchedText: string,
): string {
  return [textNodeId, start, end, keyword, matchedText].join("\u0000");
}

function formatMs(value: number): string {
  if (!Number.isFinite(value)) {
    return "0 ms";
  }

  return value < 10 ? `${value.toFixed(2)} ms` : `${Math.round(value)} ms`;
}
