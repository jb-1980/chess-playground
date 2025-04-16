import * as Types from "../../../../datasources/apollo-client/gql/types.generated"

import { gql } from "@apollo/client"
import * as Apollo from "@apollo/client"
const defaultOptions = {} as const
export type MoveMutationVariables = Types.Exact<{
  gameId: Types.Scalars["ObjectID"]["input"]
  move: Types.MoveInput
}>

export type MoveMutation = {
  __typename: "Mutation"
  move:
    | { __typename: "MoveErrorResult"; message: Types.MoveError }
    | { __typename: "MoveSuccessResult"; newPGN: string }
}

export type ObserveGameSubscriptionVariables = Types.Exact<{
  gameId: Types.Scalars["ObjectID"]["input"]
}>

export type ObserveGameSubscription = {
  __typename: "Subscription"
  observeGame: {
    __typename: "ObserveGameMsg"
    game: {
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
  }
}

export const MoveDocument = gql`
  mutation Move($gameId: ObjectID!, $move: MoveInput!) {
    move(gameId: $gameId, move: $move) {
      ... on MoveErrorResult {
        message
      }
      ... on MoveSuccessResult {
        newPGN
      }
    }
  }
`
export type MoveMutationFn = Apollo.MutationFunction<
  MoveMutation,
  MoveMutationVariables
>

/**
 * __useMoveMutation__
 *
 * To run a mutation, you first call `useMoveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveMutation, { data, loading, error }] = useMoveMutation({
 *   variables: {
 *      gameId: // value for 'gameId'
 *      move: // value for 'move'
 *   },
 * });
 */
export function useMoveMutation(
  baseOptions?: Apollo.MutationHookOptions<MoveMutation, MoveMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<MoveMutation, MoveMutationVariables>(
    MoveDocument,
    options,
  )
}
export type MoveMutationHookResult = ReturnType<typeof useMoveMutation>
export type MoveMutationResult = Apollo.MutationResult<MoveMutation>
export type MoveMutationOptions = Apollo.BaseMutationOptions<
  MoveMutation,
  MoveMutationVariables
>
export const ObserveGameDocument = gql`
  subscription ObserveGame($gameId: ObjectID!) {
    observeGame(gameId: $gameId) {
      game {
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
 * __useObserveGameSubscription__
 *
 * To run a query within a React component, call `useObserveGameSubscription` and pass it any options that fit your needs.
 * When your component renders, `useObserveGameSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useObserveGameSubscription({
 *   variables: {
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useObserveGameSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    ObserveGameSubscription,
    ObserveGameSubscriptionVariables
  > &
    (
      | { variables: ObserveGameSubscriptionVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useSubscription<
    ObserveGameSubscription,
    ObserveGameSubscriptionVariables
  >(ObserveGameDocument, options)
}
export type ObserveGameSubscriptionHookResult = ReturnType<
  typeof useObserveGameSubscription
>
export type ObserveGameSubscriptionResult =
  Apollo.SubscriptionResult<ObserveGameSubscription>
