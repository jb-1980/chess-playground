import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { setContext } from "@apollo/client/link/context"
import { createClient } from "graphql-ws"
import {
  ApolloClient,
  ApolloQueryResult,
  FetchResult,
  InMemoryCache,
  MutationOptions,
  NormalizedCacheObject,
  QueryOptions,
  createHttpLink,
  split,
} from "@apollo/client/core"
import { getMainDefinition } from "@apollo/client/utilities"
import { retrieveToken } from "../token"
import { DI } from "aurelia"

export const IGraphQLClient = DI.createInterface<GraphQLClient>(
  "IGraphQLClient",
  (x) => x.singleton(GraphQLClient),
)

export class GraphQLClient {
  private _client: ApolloClient<NormalizedCacheObject>

  constructor() {
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

    this._client = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
    })
  }

  get client() {
    return this._client
  }

  async query<TData, TVariables>(
    options: QueryOptions<TVariables, TData>,
  ): Promise<ApolloQueryResult<TData>> {
    return this._client.query<TData, TVariables>(options)
  }

  async mutate<TData, TVariables>(
    options: MutationOptions<TData, TVariables>,
  ): Promise<FetchResult<TData>> {
    return this._client.mutate<TData, TVariables>(options)
  }
}
