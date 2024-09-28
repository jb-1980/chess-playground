import { isFailure } from "../../../../lib/result"
import {
  GetGameErrorType,
  type QueryResolvers,
} from "./../../../types.generated"

export const game: NonNullable<QueryResolvers["game"]> = async (
  _parent,
  { id },
  { dataSources: { GameLoader } },
) => {
  const gameResult = await GameLoader.getGameById(id)
  if (isFailure(gameResult)) {
    return {
      __typename: "GetGameError",
      message: gameResult.message,
    }
  }

  const game = gameResult.data

  if (!game) {
    return {
      __typename: "GetGameError",
      message: GetGameErrorType.GAME_NOT_FOUND,
    }
  }

  return {
    ...gameResult.data,
    __typename: "Game",
  }
}
