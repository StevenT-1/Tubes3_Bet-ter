import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { defineConfig, type Plugin } from "vite";

function copyOcrAssets(): Plugin {
  return {
    name: "copy-local-ocr-assets",
    closeBundle() {
      const coreSourceDir = join("node_modules", "tesseract.js-core");
      const langSourceFile = join(
        "node_modules",
        "@tesseract.js-data",
        "eng",
        "4.0.0_best_int",
        "eng.traineddata.gz",
      );
      const coreOutputDir = join("dist", "tesseract", "core");
      const langOutputDir = join("dist", "tesseract", "lang");

      mkdirSync(coreOutputDir, { recursive: true });
      mkdirSync(langOutputDir, { recursive: true });

      for (const fileName of readdirSync(coreSourceDir)) {
        if (!fileName.startsWith("tesseract-core-")) {
          continue;
        }

        if (!fileName.endsWith(".js") && !fileName.endsWith(".wasm")) {
          continue;
        }

        copyFileSync(
          join(coreSourceDir, fileName),
          join(coreOutputDir, fileName),
        );
      }

      if (!existsSync(langSourceFile)) {
        throw new Error(`Missing OCR language data: ${langSourceFile}`);
      }

      copyFileSync(langSourceFile, join(langOutputDir, basename(langSourceFile)));
    },
  };
}

// Builds the local OCR worker and copies the local Tesseract core/language files.
export default defineConfig({
  base: "",
  define: {
    global: "globalThis",
    "import.meta": "{}",
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    copyPublicDir: false,
    minify: true,
    rolldownOptions: {
      input: {
        worker: "src/ocr/tesseractWorkerEntry.ts",
      },
      output: {
        format: "iife",
        entryFileNames: "tesseract/worker.min.js",
        chunkFileNames: "tesseract/[name].js",
        assetFileNames: "tesseract/[name][extname]",
        codeSplitting: false,
      },
    },
  },
  plugins: [copyOcrAssets()],
});
