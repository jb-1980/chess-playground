import suidPlugin from "@suid/vite-plugin"
import { defineConfig } from "vite"
import solid from "vite-plugin-solid"

export default defineConfig({
  plugins: [solid(), suidPlugin()],
})
