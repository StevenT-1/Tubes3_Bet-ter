import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AlgorithmResult } from "../../src/algorithms/types";
import {
  buildStatistics,
  countTotalMatches,
} from "../../src/matching/statisticsBuilder";

describe("pipeline result semantics", () => {
  it("keeps DOM text and OCR sources distinct in statistics", () => {
    const results: AlgorithmResult[] = [
      {
        algorithm: "KMP",
        source: "dom-text",
        executionTimeMs: 1,
        comparisonCount: 1,
        matches: [{ keyword: "slot", matchedText: "slot" }],
      },
      {
        algorithm: "KMP",
        source: "image-ocr",
        executionTimeMs: 2,
        comparisonCount: 1,
        matches: [{ keyword: "slot", matchedText: "SLOT" }],
      },
    ];

    const statistics = buildStatistics(results);

    assert.equal(statistics[0].keyword, "slot");
    assert.deepEqual(
      statistics[0].details.map((detail) => detail.type),
      ["Text", "OCR"],
    );
  });

  it("counts only primary detection results supplied by the coordinator", () => {
    const primaryResults: AlgorithmResult[] = [
      {
        algorithm: "KMP",
        source: "dom-text",
        executionTimeMs: 1,
        comparisonCount: 1,
        matches: [{ keyword: "gacor", matchedText: "gacor" }],
      },
    ];

    assert.equal(countTotalMatches(primaryResults), 1);
  });
});
