import suidPlugin from "@suid/vite-plugin"
import solid from "vite-plugin-solid"
import { defineConfig as defineViteConfig, mergeConfig } from "vite"
import { defineConfig as defineVitestConfig } from "vitest/config"

// https://vitejs.dev/config/
const viteConfig = defineViteConfig({
  plugins: [solid(), suidPlugin()],
})

const vitestConfig = defineVitestConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-utils/setup.ts",
  },
})

export default mergeConfig(viteConfig, vitestConfig)
