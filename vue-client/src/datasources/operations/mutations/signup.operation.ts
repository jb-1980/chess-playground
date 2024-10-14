import type * as Types from "@/datasources/types.generated.ts"

import gql from "graphql-tag"
import * as VueApolloComposable from "@vue/apollo-composable"
import type * as VueCompositionApi from "vue"
export type ReactiveFunction<TParam> = () => TParam
export type RegisterMutationVariables = Types.Exact<{
  username: Types.Scalars["String"]["input"]
  password: Types.Scalars["String"]["input"]
}>

export type RegisterMutation = {
  __typename?: "Mutation"
  register:
    | { __typename?: "RegisterError"; message: string }
    | { __typename?: "RegisterSuccess"; token: string }
}

export const RegisterDocument = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      ... on RegisterSuccess {
        token
      }
      ... on RegisterError {
        message
      }
    }
  }
`

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useRegisterMutation({
 *   variables: {
 *     username: // value for 'username'
 *     password: // value for 'password'
 *   },
 * });
 */
export function useRegisterMutation(
  options:
    | VueApolloComposable.UseMutationOptions<
        RegisterMutation,
        RegisterMutationVariables
      >
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<
          RegisterMutation,
          RegisterMutationVariables
        >
      > = {},
) {
  return VueApolloComposable.useMutation<
    RegisterMutation,
    RegisterMutationVariables
  >(RegisterDocument, options)
}
export type RegisterMutationCompositionFunctionResult =
  VueApolloComposable.UseMutationReturn<
    RegisterMutation,
    RegisterMutationVariables
  >
