import { isFailure } from "../../../../lib/result"
import type { QueryResolvers } from "./../../../types.generated"
export const gamesForPlayerId: NonNullable<
  QueryResolvers["gamesForPlayerId"]
> = async (_parent, { id }, { dataSources: { GameLoader } }) => {
  /* Implement Query.gamesForPlayerId resolver logic here */
  const gamesResult = await GameLoader.getGamesForPlayerId(id)

  if (isFailure(gamesResult)) {
    return {
      __typename: "GetGamesForPlayerIdError",
      message: gamesResult.message,
    }
  }

  return {
    __typename: "GetGamesForPlayer",
    games: gamesResult.data,
  }
}
