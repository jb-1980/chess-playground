import * as Types from "../../../../datasources/apollo-client/gql/types.generated"

import { gql } from "@apollo/client"
import * as Apollo from "@apollo/client"
const defaultOptions = {} as const
export type GetGamesQueryVariables = Types.Exact<{
  playerId: Types.Scalars["ID"]["input"]
}>

export type GetGamesQuery = {
  __typename: "Query"
  gamesForPlayerId:
    | {
        __typename: "GetGamesForPlayer"
        games: Array<{
          __typename: "Game"
          id: string
          pgn: string
          status: Types.GameStatus
          moves: Array<{
            __typename: "Move"
            color: Types.Color
            from: Types.Square
            to: Types.Square
            piece: Types.Piece
            captured: Types.Piece | null
            promotion: Types.Piece | null
            flags: string
            san: string
            lan: string
            before: string
            after: string
          }>
          whitePlayer: {
            __typename: "GameUser"
            id: string
            rating: number
            username: string
            avatarUrl: string | null
          }
          blackPlayer: {
            __typename: "GameUser"
            id: string
            rating: number
            username: string
            avatarUrl: string | null
          }
        }>
      }
    | {
        __typename: "GetGamesForPlayerIdError"
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
 * To run a query within a React component, call `useGetGamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGamesQuery({
 *   variables: {
 *      playerId: // value for 'playerId'
 *   },
 * });
 */
export function useGetGamesQuery(
  baseOptions: Apollo.QueryHookOptions<GetGamesQuery, GetGamesQueryVariables> &
    ({ variables: GetGamesQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetGamesQuery, GetGamesQueryVariables>(
    GetGamesDocument,
    options,
  )
}
export function useGetGamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGamesQuery,
    GetGamesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetGamesQuery, GetGamesQueryVariables>(
    GetGamesDocument,
    options,
  )
}
export function useGetGamesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetGamesQuery, GetGamesQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions }
  return Apollo.useSuspenseQuery<GetGamesQuery, GetGamesQueryVariables>(
    GetGamesDocument,
    options,
  )
}
export type GetGamesQueryHookResult = ReturnType<typeof useGetGamesQuery>
export type GetGamesLazyQueryHookResult = ReturnType<
  typeof useGetGamesLazyQuery
>
export type GetGamesSuspenseQueryHookResult = ReturnType<
  typeof useGetGamesSuspenseQuery
>
export type GetGamesQueryResult = Apollo.QueryResult<
  GetGamesQuery,
  GetGamesQueryVariables
>
