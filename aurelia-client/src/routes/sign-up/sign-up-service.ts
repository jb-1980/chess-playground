import { resolve } from "aurelia"
import {
  GraphQLClient,
  IGraphQLClient,
} from "../../resources/apollo-client/client"
import {
  RegisterDocument,
  RegisterMutation,
  RegisterMutationVariables,
} from "./sign-up.operation"
import { match } from "ts-pattern"

export enum SignupError {
  USER_ALREADY_EXISTS = "User already exists",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

export class SignUpService {
  private graphQLClient: GraphQLClient = resolve(IGraphQLClient)

  async signup(
    username: string,
    password: string,
  ): Promise<
    | {
        _type: "SignUpSuccess"
        token: string
      }
    | {
        _type: "SignUpError"
        error: string
      }
  > {
    try {
      const response = await this.graphQLClient.mutate<
        RegisterMutation,
        RegisterMutationVariables
      >({
        mutation: RegisterDocument,
        variables: {
          username,
          password,
        },
      })

      const data = match(response.data?.register)
        .with({ __typename: "RegisterSuccess" }, ({ token }) => token)
        .with({ __typename: "RegisterError" }, () => null)
        .with(undefined, () => undefined)
        .exhaustive()

      const error =
        response.errors?.length > 0
          ? SignupError.UNKNOWN_SERVER_ERROR
          : match(response.data?.register)
              .with(
                {
                  __typename: "RegisterError",
                  message: "USER_ALREADY_EXISTS",
                },
                () => SignupError.USER_ALREADY_EXISTS,
              )
              .with(
                { __typename: "RegisterError" },
                () => SignupError.UNKNOWN_SERVER_ERROR,
              )
              .with({ __typename: "RegisterSuccess" }, () => undefined)
              .with(undefined, () => undefined)
              .exhaustive()

      if (data) {
        return {
          _type: "SignUpSuccess",
          token: data,
        }
      }
      return {
        _type: "SignUpError",
        error,
      }
    } catch (e) {
      return {
        _type: "SignUpError",
        error: e.message,
      }
    }
  }
}
