import { defineConfig } from "vite";

export default defineConfig({
  base: "",
  define: {
    global: "globalThis",
    Buffer: "globalThis.Buffer",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        popup: "src/popup/popup.ts",
        background: "src/background/background.ts",
        offscreen: "src/offscreen/offscreen.ts",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});