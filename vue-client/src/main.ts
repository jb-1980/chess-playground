/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins"

import { DefaultApolloClient } from "@vue/apollo-composable"

// Components
import App from "./App.vue"

// Composables
import { createApp, provide, h } from "vue"
import { apolloClient } from "./datasources/apollo-client"

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

registerPlugins(app)

app.mount("#app")
