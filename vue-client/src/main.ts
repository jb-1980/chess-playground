/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins"

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core"
import { DefaultApolloClient } from "@vue/apollo-composable"

// Components
import App from "./App.vue"

// Composables
import { createApp, provide, h } from "vue"

const httpLink = createHttpLink({
  uri: "http://localhost:3001/graphql",
})

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

registerPlugins(app)

app.mount("#app")
