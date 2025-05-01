import solid from "vite-plugin-solid"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig as defineViteConfig, mergeConfig } from "vite"
import { defineConfig as defineVitestConfig } from "vitest/config"
import path from "node:path"

const viteConfig = defineViteConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      "@/ui": path.resolve(__dirname, "./src/components/ui"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

const vitestConfig = defineVitestConfig({
  resolve: {
    alias: {
      "@test-utils": path.resolve(__dirname, "./src/test-utils/index.js"),
    },
  },
  test: {
    environment: "jsdom",
    env: {
      VITEST: "true",
    },
    globals: true,
    setupFiles: "./src/test-utils/setup.ts",
  },
})

export default mergeConfig(viteConfig, vitestConfig)
