import { resolve } from "aurelia"
import {
  GraphQLClient,
  IGraphQLClient,
} from "../../resources/apollo-client/client"

import { match } from "ts-pattern"
import { Game } from "../../types/game"
import {
  GameDocument,
  GameQuery,
  GameQueryVariables,
} from "./get-game.operation"

export enum GetGameError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

export class GameReviewService {
  private graphQLClient: GraphQLClient = resolve(IGraphQLClient)

  async getGame(gameId: string): Promise<
    | {
        _type: "GameSuccess"
        game: Game
      }
    | {
        _type: "GameError"
        error: string
      }
  > {
    try {
      const result = await this.graphQLClient.query<
        GameQuery,
        GameQueryVariables
      >({
        query: GameDocument,
        variables: { gameId },
      })
      const data = match(result.data?.game)
        .with({ __typename: "GetGameError" }, () => null)
        .with({ __typename: "Game" }, (game) => ({
          ...game,
          moves: game.moves.map((m) => ({
            ...m,
            captured: m.captured ?? undefined,
            promotion: m.promotion ?? undefined,
          })),
        }))
        .with(undefined, () => undefined)
        .exhaustive()

      const error = result.error
        ? GetGameError.UNKNOWN_SERVER_ERROR
        : match(result.data?.game)
            .with(
              {
                __typename: "GetGameError",
                message: GetGameError.GAME_NOT_FOUND,
              },
              () => GetGameError.GAME_NOT_FOUND,
            )
            .with(
              { __typename: "GetGameError" },
              () => GetGameError.UNKNOWN_SERVER_ERROR,
            )
            .with({ __typename: "Game" }, () => undefined)
            .with(undefined, () => undefined)
            .exhaustive()
      if (data) {
        return {
          _type: "GameSuccess",
          game: data,
        }
      } else {
        return {
          _type: "GameError",
          error,
        }
      }
    } catch (e) {
      return {
        _type: "GameError",
        error: e.message,
      }
    }
  }
}
