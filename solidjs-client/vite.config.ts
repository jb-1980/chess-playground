import suidPlugin from "@suid/vite-plugin"
import solid from "vite-plugin-solid"
import { defineConfig as defineViteConfig, mergeConfig } from "vite"
import { defineConfig as defineVitestConfig } from "vitest/config"
import path from "node:path"

const viteConfig = defineViteConfig({
  plugins: [solid(), suidPlugin()],
})

const vitestConfig = defineVitestConfig({
  resolve: {
    alias: {
      "@test-utils": path.resolve(__dirname, "./src/test-utils/index.js"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-utils/setup.ts",
  },
})

export default mergeConfig(viteConfig, vitestConfig)
