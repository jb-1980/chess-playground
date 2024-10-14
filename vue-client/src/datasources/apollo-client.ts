import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { setContext } from "@apollo/client/link/context"
import { createClient } from "graphql-ws"
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from "@apollo/client/core"
import { retrieveToken } from "../lib/token"
import { getMainDefinition } from "@apollo/client/utilities"

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_SUBSCRIPTIONS_URL,
    connectionParams: {
      authentication: `Bearer ${retrieveToken() ?? "null"}`,
    },
  }),
)

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
})

const authLink = setContext((_, { headers }) => {
  const token = retrieveToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  authLink.concat(httpLink),
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})
