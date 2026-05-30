import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = "src";
const FORBIDDEN_PATTERN = /\.(includes|indexOf)\(/;

describe("source string-search restrictions", () => {
  it("does not use .includes() or .indexOf() under src", () => {
    const offenders: string[] = [];

    for (const filePath of listSourceFiles(SRC_DIR)) {
      const text = readFileSync(filePath, "utf8");

      if (FORBIDDEN_PATTERN.test(text)) {
        offenders.push(filePath);
      }
    }

    assert.deepEqual(offenders, []);
  });
});

function listSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listSourceFiles(entryPath));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}
