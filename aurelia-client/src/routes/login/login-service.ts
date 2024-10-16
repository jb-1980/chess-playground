import { resolve } from "aurelia"
import {
  GraphQLClient,
  IGraphQLClient,
} from "../../resources/apollo-client/client"
import {
  LoginDocument,
  LoginMutation,
  LoginMutationVariables,
} from "./login.operation"
import { match } from "ts-pattern"

export enum LoginError {
  INCORRECT_USERNAME_OR_PASSWORD = "Incorrect username or password",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

export class LoginService {
  private graphQLClient: GraphQLClient = resolve(IGraphQLClient)

  async login(
    username: string,
    password: string,
  ): Promise<
    | {
        _type: "LoginSuccess"
        token: string
      }
    | {
        _type: "LoginError"
        error: string
      }
  > {
    try {
      const response = await this.graphQLClient.mutate<
        LoginMutation,
        LoginMutationVariables
      >({
        mutation: LoginDocument,
        variables: {
          username,
          password,
        },
      })
      const data = match(response.data?.login)
        .with({ __typename: "LoginSuccess" }, ({ token }) => token)
        .with({ __typename: "LoginError" }, () => null)
        .with(undefined, () => undefined)
        .exhaustive()

      const error =
        response.errors?.length > 0
          ? LoginError.UNKNOWN_SERVER_ERROR
          : match(response.data?.login)
              .with(
                {
                  __typename: "LoginError",
                  message: "BAD_CREDENTIALS",
                },
                () => LoginError.INCORRECT_USERNAME_OR_PASSWORD,
              )
              .with(
                { __typename: "LoginError" },
                () => LoginError.UNKNOWN_SERVER_ERROR,
              )
              .with({ __typename: "LoginSuccess" }, () => undefined)
              .with(undefined, () => undefined)
              .exhaustive()
      if (data) {
        return {
          _type: "LoginSuccess",
          token: data,
        }
      } else {
        return {
          _type: "LoginError",
          error,
        }
      }
    } catch (e) {
      return {
        _type: "LoginError",
        error: e.message,
      }
    }
  }
}
