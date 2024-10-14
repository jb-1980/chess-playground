import type * as Types from "@/datasources/types.generated.ts"

import gql from "graphql-tag"
import * as VueApolloComposable from "@vue/apollo-composable"
import type * as VueCompositionApi from "vue"
export type ReactiveFunction<TParam> = () => TParam
export type GetGamesQueryVariables = Types.Exact<{
  playerId: Types.Scalars["ID"]["input"]
}>

export type GetGamesQuery = {
  __typename?: "Query"
  gamesForPlayerId:
    | {
        __typename?: "GetGamesForPlayer"
        games: Array<{
          __typename?: "Game"
          id: string
          pgn: string
          status: Types.GameStatus
          moves: Array<{
            __typename?: "Move"
            color: Types.Color
            from: Types.Square
            to: Types.Square
            piece: Types.Piece
            captured?: Types.Piece | null
            promotion?: Types.Piece | null
            flags: string
            san: string
            lan: string
            before: string
            after: string
          }>
          whitePlayer: {
            __typename?: "GameUser"
            id: string
            rating: number
            username: string
            avatarUrl?: string | null
          }
          blackPlayer: {
            __typename?: "GameUser"
            id: string
            rating: number
            username: string
            avatarUrl?: string | null
          }
        }>
      }
    | {
        __typename?: "GetGamesForPlayerIdError"
        message: Types.GetGameErrorType
      }
}

export const GetGamesDocument = gql`
  query GetGames($playerId: ID!) {
    gamesForPlayerId(id: $playerId) {
      ... on GetGamesForPlayerIdError {
        message
      }
      ... on GetGamesForPlayer {
        games {
          id
          moves {
            color
            from
            to
            piece
            captured
            promotion
            flags
            san
            lan
            before
            after
          }
          pgn
          whitePlayer {
            id
            rating
            username
            avatarUrl
          }
          blackPlayer {
            id
            rating
            username
            avatarUrl
          }
          status
        }
      }
    }
  }
`

/**
 * __useGetGamesQuery__
 *
 * To run a query within a Vue component, call `useGetGamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGamesQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetGamesQuery({
 *   playerId: // value for 'playerId'
 * });
 */
export function useGetGamesQuery(
  variables:
    | GetGamesQueryVariables
    | VueCompositionApi.Ref<GetGamesQueryVariables>
    | ReactiveFunction<GetGamesQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<GetGamesQuery, GetGamesQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<
          GetGamesQuery,
          GetGamesQueryVariables
        >
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<
          GetGamesQuery,
          GetGamesQueryVariables
        >
      > = {},
) {
  return VueApolloComposable.useQuery<GetGamesQuery, GetGamesQueryVariables>(
    GetGamesDocument,
    variables,
    options,
  )
}
export function useGetGamesLazyQuery(
  variables?:
    | GetGamesQueryVariables
    | VueCompositionApi.Ref<GetGamesQueryVariables>
    | ReactiveFunction<GetGamesQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<GetGamesQuery, GetGamesQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<
          GetGamesQuery,
          GetGamesQueryVariables
        >
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<
          GetGamesQuery,
          GetGamesQueryVariables
        >
      > = {},
) {
  return VueApolloComposable.useLazyQuery<
    GetGamesQuery,
    GetGamesQueryVariables
  >(GetGamesDocument, variables, options)
}
export type GetGamesQueryCompositionFunctionResult =
  VueApolloComposable.UseQueryReturn<GetGamesQuery, GetGamesQueryVariables>
