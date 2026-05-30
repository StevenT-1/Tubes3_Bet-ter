import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";

describe("content bundle", () => {
  it("has no top-level import when dist/content.js exists", (context) => {
    const bundlePath = "dist/content.js";

    if (!existsSync(bundlePath)) {
      context.skip("dist/content.js has not been built yet.");
      return;
    }

    const bundle = readFileSync(bundlePath, "utf8");

    assert.equal(/^import\s/m.test(bundle), false);
    assert.equal(/^\s*import\s/.test(bundle), false);
  });
});
