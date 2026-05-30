import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runTextAlgorithms } from "../../src/matching/textScanEngine";

describe("runTextAlgorithms", () => {
  it("always runs KMP", () => {
    const results = runTextAlgorithms("slot gacor", ["slot"], "dom-text", true, {
      runRabinKarp: false,
    });

    assert.deepEqual(results.map((result) => result.algorithm), ["KMP"]);
  });

  it("runs Rabin-Karp only when enabled", () => {
    const results = runTextAlgorithms("slot gacor", ["slot"], "dom-text", true, {
      runRabinKarp: true,
    });

    assert.deepEqual(results.map((result) => result.algorithm), ["KMP", "Rabin-Karp"]);
  });

  it("does not include Rabin-Karp when disabled", () => {
    const results = runTextAlgorithms("slot gacor", ["slot"], "dom-text", true, {
      runRabinKarp: false,
    });

    assert.equal(results.some((result) => result.algorithm === "Rabin-Karp"), false);
  });

  it("preserves source for every enabled algorithm", () => {
    const results = runTextAlgorithms("slot", ["slot"], "image-ocr", true, {
      runRabinKarp: true,
    });

    assert.deepEqual(results.map((result) => result.source), ["image-ocr", "image-ocr"]);
  });
});
