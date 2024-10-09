import type * as Types from "../gql/types.generated"

import gql from "graphql-tag"
import * as VueApolloComposable from "@vue/apollo-composable"
import type * as VueCompositionApi from "vue"
export type ReactiveFunction<TParam> = () => TParam
export type LoginMutationVariables = Types.Exact<{
  username: Types.Scalars["String"]["input"]
  password: Types.Scalars["String"]["input"]
}>

export type LoginMutation = {
  __typename?: "Mutation"
  login:
    | { __typename?: "LoginError"; message: string }
    | { __typename?: "LoginSuccess"; token: string }
}

export const LoginDocument = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ... on LoginSuccess {
        token
      }
      ... on LoginError {
        message
      }
    }
  }
`

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useLoginMutation({
 *   variables: {
 *     username: // value for 'username'
 *     password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(
  options:
    | VueApolloComposable.UseMutationOptions<
        LoginMutation,
        LoginMutationVariables
      >
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<
          LoginMutation,
          LoginMutationVariables
        >
      > = {},
) {
  return VueApolloComposable.useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    options,
  )
}
export type LoginMutationCompositionFunctionResult =
  VueApolloComposable.UseMutationReturn<LoginMutation, LoginMutationVariables>
