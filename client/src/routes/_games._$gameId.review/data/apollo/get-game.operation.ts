import * as Types from "../../../../datasources/apollo-client/gql/types.generated"

import { gql } from "@apollo/client"
import * as Apollo from "@apollo/client"
const defaultOptions = {} as const
export type GameQueryVariables = Types.Exact<{
  gameId: Types.Scalars["ObjectID"]["input"]
}>

export type GameQuery = {
  __typename: "Query"
  game:
    | {
        __typename: "Game"
        id: any
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
          id: any
          rating: number
          username: string
          avatarUrl: string | null
        }
        blackPlayer: {
          __typename: "GameUser"
          id: any
          rating: number
          username: string
          avatarUrl: string | null
        }
      }
    | { __typename: "GetGameError"; message: Types.GetGameErrorType }
}

export const GameDocument = gql`
  query Game($gameId: ObjectID!) {
    game(id: $gameId) {
      ... on GetGameError {
        message
      }
      ... on Game {
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
`

/**
 * __useGameQuery__
 *
 * To run a query within a React component, call `useGameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGameQuery({
 *   variables: {
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useGameQuery(
  baseOptions: Apollo.QueryHookOptions<GameQuery, GameQueryVariables> &
    ({ variables: GameQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GameQuery, GameQueryVariables>(GameDocument, options)
}
export function useGameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GameQuery, GameQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GameQuery, GameQueryVariables>(
    GameDocument,
    options,
  )
}
export function useGameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GameQuery, GameQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions }
  return Apollo.useSuspenseQuery<GameQuery, GameQueryVariables>(
    GameDocument,
    options,
  )
}
export type GameQueryHookResult = ReturnType<typeof useGameQuery>
export type GameLazyQueryHookResult = ReturnType<typeof useGameLazyQuery>
export type GameSuspenseQueryHookResult = ReturnType<
  typeof useGameSuspenseQuery
>
export type GameQueryResult = Apollo.QueryResult<GameQuery, GameQueryVariables>
