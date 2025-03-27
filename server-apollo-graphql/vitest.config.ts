import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@test-utils": "./src/test-utils/mongo-server.ts",
    },
  },
  test: {
    setupFiles: ["./src/test-utils/setup.ts"],
    include: ["./src/**/*.test.ts"],
  },
})
