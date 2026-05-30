import { defineConfig } from "vite";

export default defineConfig({
  base: "",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    copyPublicDir: false,
    rolldownOptions: {
      input: {
        content: "src/content/content.ts",
      },
      output: {
        entryFileNames: "content.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
        codeSplitting: false,
      },
    },
  },
});
