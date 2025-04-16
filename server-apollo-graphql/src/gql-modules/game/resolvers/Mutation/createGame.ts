import { ObjectId } from "mongodb"
import {
  CreateGameError,
  type MutationResolvers,
} from "./../../../types.generated"
import { pubsub } from "../../../../pubsub"
const Queue = new Set<string>()
const PlayersInActiveGames = new Set<string>()

const shiftSet = <T>(set: Set<T>): T | undefined => {
  for (const item of set) {
    set.delete(item)
    return item
  }
  return
}

export const createGame: NonNullable<MutationResolvers["createGame"]> = async (
  _parent,
  { playerId },
  _ctx,
) => {
  if (PlayersInActiveGames.has(playerId)) {
    return {
      __typename: "CreateGameErrorResult",
      message: CreateGameError.PLAYER_IN_ACTIVE_GAME,
    }
  }

  // check if this user has already joined the queue
  const alreadyWaiting = Queue.has(playerId)
  if (!alreadyWaiting) {
    // there is no one in the queue, so add this user to the queue and return
    if (Queue.size === 0) {
      Queue.add(playerId)
      return null
    }

    const newPlayerId = playerId
    const waitingPlayerId = shiftSet(Queue)

    if (waitingPlayerId) {
      PlayersInActiveGames.add(waitingPlayerId)
      PlayersInActiveGames.add(newPlayerId)
      // generate a random objectId string
      const gameId = new ObjectId().toHexString()

      pubsub.publish(`JOIN_GAME${playerId}`, {
        joinGame: gameId,
      })
      pubsub.publish(`JOIN_GAME${waitingPlayerId}`, {
        joinGame: gameId,
      })
      return {
        __typename: "CreateGameSuccessResult",
        gameId,
      }
    }
  }
  return null
}
