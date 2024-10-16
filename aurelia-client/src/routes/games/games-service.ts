import { resolve } from "aurelia"
import {
  GraphQLClient,
  IGraphQLClient,
} from "../../resources/apollo-client/client"

import { match } from "ts-pattern"
import { Game } from "../../types/game"
import {
  GetGamesDocument,
  GetGamesQuery,
  GetGamesQueryVariables,
} from "./get-games.operation"

export enum GetGamesError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

export class GamesService {
  private graphQLClient: GraphQLClient = resolve(IGraphQLClient)

  async getGames(playerId: string): Promise<
    | {
        _type: "GamesSuccess"
        games: Game[]
      }
    | {
        _type: "GamesError"
        error: string
      }
  > {
    try {
      const result = await this.graphQLClient.query<
        GetGamesQuery,
        GetGamesQueryVariables
      >({
        query: GetGamesDocument,
        variables: { playerId },
      })
      const data = match(result.data?.gamesForPlayerId)
        .with({ __typename: "GetGamesForPlayerIdError" }, () => null)
        .with({ __typename: "GetGamesForPlayer" }, ({ games }) =>
          games.map((g) => ({
            ...g,
            moves: g.moves.map((m) => ({
              ...m,
              captured: m.captured ?? undefined,
              promotion: m.promotion ?? undefined,
            })),
          })),
        )
        .with(undefined, () => undefined)
        .exhaustive()

      const error = result.error
        ? GetGamesError.UNKNOWN_SERVER_ERROR
        : match(result.data?.gamesForPlayerId)
            .with(
              {
                __typename: "GetGamesForPlayerIdError",
                message: GetGamesError.GAME_NOT_FOUND,
              },
              () => GetGamesError.GAME_NOT_FOUND,
            )
            .with(
              { __typename: "GetGamesForPlayerIdError" },
              () => GetGamesError.UNKNOWN_SERVER_ERROR,
            )
            .with({ __typename: "GetGamesForPlayer" }, () => undefined)
            .with(undefined, () => undefined)
            .exhaustive()
      if (data) {
        return {
          _type: "GamesSuccess",
          games: data,
        }
      } else {
        return {
          _type: "GamesError",
          error,
        }
      }
    } catch (e) {
      return {
        _type: "GamesError",
        error: e.message,
      }
    }
  }
}
