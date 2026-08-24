// Standalone Vitest config so unit tests run without the Wasp vite plugin
// (vite.config.ts imports "wasp/client/vite", which only resolves after wasp install).
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
