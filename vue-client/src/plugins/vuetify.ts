/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"

// Composables
import { createVuetify, ThemeDefinition } from "vuetify"

const customTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#4e7837",
    secondary: "#4b4847",
  },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: "customTheme",
    themes: {
      customTheme,
    },
  },
})
