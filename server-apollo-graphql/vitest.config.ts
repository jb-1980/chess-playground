import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@test-utils": new URL("./src/test-utils/index.ts", import.meta.url)
        .pathname,
    },
  },
  test: {
    setupFiles: ["./src/test-utils/setup.ts"],
    include: ["./src/**/*.test.ts"],
    environment: "mongodb",
    environmentOptions: {
      type: "default",
      // mongoUrlEnvName: "MONGO_URL",
    },
  },
})
