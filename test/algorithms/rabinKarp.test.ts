import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { searchRabinKarp } from "../../src/algorithms/rabinKarp";

describe("searchRabinKarp", () => {
  it("finds a simple keyword", () => {
    const result = searchRabinKarp(["slot"], "main slot page", "dom-text", false);

    assert.equal(result.matches.length, 1);
    assert.equal(result.matches[0].startIndex, 5);
    assert.equal(result.matches[0].matchedText, "slot");
  });

  it("supports case-insensitive search", () => {
    const result = searchRabinKarp(["slot"], "SLOT gacor", "dom-text", true);

    assert.equal(result.matches.length, 1);
    assert.equal(result.matches[0].matchedText, "SLOT");
  });

  it("preserves original matched text casing", () => {
    const result = searchRabinKarp(["maxwin"], "MAXWIN MaxWin", "dom-text", true);

    assert.deepEqual(result.matches.map((match) => match.matchedText), [
      "MAXWIN",
      "MaxWin",
    ]);
  });

  it("handles multiple keywords", () => {
    const result = searchRabinKarp(["slot", "gacor"], "slot gacor", "dom-text", true);

    assert.deepEqual(result.matches.map((match) => match.keyword), ["slot", "gacor"]);
  });

  it("preserves DOM text source", () => {
    const result = searchRabinKarp(["slot"], "slot", "dom-text", true);

    assert.equal(result.source, "dom-text");
  });

  it("preserves image OCR source", () => {
    const result = searchRabinKarp(["slot"], "slot", "image-ocr", true);

    assert.equal(result.source, "image-ocr");
  });

  it("supports overlapping matches", () => {
    const result = searchRabinKarp(["aa"], "aaa", "dom-text", false);

    assert.deepEqual(
      result.matches.map((match) => match.startIndex),
      [0, 1],
    );
  });

  it("ignores empty keywords", () => {
    const result = searchRabinKarp([""], "slot", "dom-text", true);

    assert.equal(result.matches.length, 0);
  });
});
