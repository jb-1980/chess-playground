import * as Types from "../../resources/apollo-client/types.generated"

import { gql } from "@apollo/client/core"
import * as Apollo from "@apollo/client"
export type RegisterMutationVariables = Types.Exact<{
  username: Types.Scalars["String"]["input"]
  password: Types.Scalars["String"]["input"]
}>

export type RegisterMutation = {
  __typename: "Mutation"
  register:
    | { __typename: "RegisterError"; message: string }
    | { __typename: "RegisterSuccess"; token: string }
}

export const RegisterDocument = /*#__PURE__*/ gql`
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
export type RegisterMutationFn = Apollo.MutationFunction<
  RegisterMutation,
  RegisterMutationVariables
>
export type RegisterMutationOptions = Apollo.BaseMutationOptions<
  RegisterMutation,
  RegisterMutationVariables
>
