import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    glsl(), // Add GLSL shader support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      // Polyfills for Node.js modules
      "buffer": "buffer",
      "process": "process/browser",
      "util": "util",
      "stream": "stream-browserify",
      "crypto": "crypto-browserify",
      "fs": false,
      "path": false,
      "os": false,
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      external: ["bufferutil", "utf-8-validate"],
    },
  },
  // Add support for large models and audio files
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"],
  define: {
    // Polyfill global variables
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    exclude: ["bufferutil", "utf-8-validate"],
    include: ["buffer", "process", "util"],
  },
});
