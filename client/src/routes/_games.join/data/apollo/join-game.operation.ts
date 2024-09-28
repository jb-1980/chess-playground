import * as Types from "../../../../datasources/apollo-client/gql/types.generated"

import { gql } from "@apollo/client"
import * as Apollo from "@apollo/client"
const defaultOptions = {} as const
export type JoinGameSubscriptionVariables = Types.Exact<{
  playerId: Types.Scalars["ID"]["input"]
}>

export type JoinGameSubscription = {
  __typename: "Subscription"
  joinGame:
    | { __typename: "JoinGameErrorMsg"; message: Types.JoinGameError }
    | { __typename: "JoinGameMsg"; gameId: string }
}

export const JoinGameDocument = gql`
  subscription JoinGame($playerId: ID!) {
    joinGame(playerId: $playerId) {
      ... on JoinGameMsg {
        gameId
      }
      ... on JoinGameErrorMsg {
        message
      }
    }
  }
`

/**
 * __useJoinGameSubscription__
 *
 * To run a query within a React component, call `useJoinGameSubscription` and pass it any options that fit your needs.
 * When your component renders, `useJoinGameSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJoinGameSubscription({
 *   variables: {
 *      playerId: // value for 'playerId'
 *   },
 * });
 */
export function useJoinGameSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    JoinGameSubscription,
    JoinGameSubscriptionVariables
  > &
    (
      | { variables: JoinGameSubscriptionVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useSubscription<
    JoinGameSubscription,
    JoinGameSubscriptionVariables
  >(JoinGameDocument, options)
}
export type JoinGameSubscriptionHookResult = ReturnType<
  typeof useJoinGameSubscription
>
export type JoinGameSubscriptionResult =
  Apollo.SubscriptionResult<JoinGameSubscription>
