import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addUniqueWarning } from "../../src/ocr/warnings";

describe("OCR warning handling", () => {
  it("deduplicates warnings with a Set", () => {
    const warningSet = new Set<string>();
    const warnings: string[] = [];

    addUniqueWarning(warningSet, warnings, "OCR failed for one image.");
    addUniqueWarning(warningSet, warnings, "OCR failed for one image.");
    addUniqueWarning(warningSet, warnings, "");

    assert.deepEqual(warnings, ["OCR failed for one image."]);
  });

  it("keeps per-image OCR failures as warning data", () => {
    const warningSet = new Set<string>();
    const warnings: string[] = [];

    assert.doesNotThrow(() => {
      addUniqueWarning(warningSet, warnings, "OCR failed for one image.");
    });
    assert.equal(warnings.length, 1);
  });
});
