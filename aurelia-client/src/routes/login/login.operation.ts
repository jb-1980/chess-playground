import * as Types from "../../resources/apollo-client/types.generated"

import { gql } from "@apollo/client/core"
import * as Apollo from "@apollo/client"
export type LoginMutationVariables = Types.Exact<{
  username: Types.Scalars["String"]["input"]
  password: Types.Scalars["String"]["input"]
}>

export type LoginMutation = {
  __typename: "Mutation"
  login:
    | { __typename: "LoginError"; message: string }
    | { __typename: "LoginSuccess"; token: string }
}

export const LoginDocument = /*#__PURE__*/ gql`
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
export type LoginMutationFn = Apollo.MutationFunction<
  LoginMutation,
  LoginMutationVariables
>
export type LoginMutationOptions = Apollo.BaseMutationOptions<
  LoginMutation,
  LoginMutationVariables
>
