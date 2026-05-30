import { Buffer as BrowserBuffer } from "buffer";

const globalWithBuffer = globalThis as typeof globalThis & {
  Buffer: typeof BrowserBuffer;
};

// Tesseract's worker bundle expects Buffer in its own worker global scope.
globalWithBuffer.Buffer = BrowserBuffer;

void import("tesseract.js/src/worker-script/browser/index.js");
