import { withFilter } from "graphql-subscriptions"
import { pubsub } from "../../../../pubsub"
import {
  JoinGameError,
  type SubscriptionResolvers,
  type User,
} from "./../../../types.generated"
import { ObjectId } from "mongodb"
import { PlayersInActiveGames, Queue, shiftSet } from "../../utils"
import { GameMutator } from "../../datasources/dataloader"
import {
  AsyncResult,
  isFailure,
  isSuccess,
  Result,
} from "../../../../lib/result"
import { UserLoader } from "../../../user/datasources/dataloader"

export const command_CreateGame = async (
  playerIds: [string, string],
): AsyncResult<
  {
    gameId: string
  },
  | "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"
  | "USERS_NOT_FOUND"
  | "DB_ERR_FAILED_TO_CREATE_GAME"
> => {
  const usersResult = await new UserLoader().getUsersByIds(playerIds)
  if (isFailure(usersResult)) {
    return usersResult
  }
  const users = usersResult.data
  // randomly choose a player to be white
  const whitePlayer = users[Math.round(Math.random())]
  const blackPlayer = users.find(
    (user) => user.username !== whitePlayer.username,
  )

  if (!whitePlayer || !blackPlayer) {
    return Result.Fail("USERS_NOT_FOUND")
  }

  const createGameResult = await new GameMutator().createGame(
    whitePlayer,
    blackPlayer,
  )

  if (isSuccess(createGameResult)) {
    return Result.Success({
      gameId: createGameResult.data,
    })
  }

  return createGameResult
}

const placeInQueue = (playerId: string) =>
  new Promise<string>((resolve) => {
    const now = Date.now()
    // try for 30 seconds to find a match, else return no match found
    const timeout = now + 30000
    const interval = setInterval(async () => {
      if (Date.now() > timeout) {
        pubsub.publish(`JOIN_GAME${playerId}`, {
          joinGame: {
            __typename: "JoinGameErrorMsg",
            message: JoinGameError.NO_MATCH_FOUND,
          },
        })
        if (Queue.has(playerId)) {
          Queue.delete(playerId)
        }
        clearInterval(interval)
        return resolve(null)
      }
      if (PlayersInActiveGames.has(playerId)) {
        clearInterval(interval)
        return resolve(null)
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
          const createGameResult = await command_CreateGame([
            newPlayerId,
            waitingPlayerId,
          ])

          if (isFailure(createGameResult)) {
            pubsub.publish(`JOIN_GAME${playerId}`, {
              joinGame: {
                __typename: "JoinGameErrorMsg",
                message: JoinGameError.ERROR_CREATING_GAME,
              },
            })
            pubsub.publish(`JOIN_GAME${waitingPlayerId}`, {
              joinGame: {
                __typename: "JoinGameErrorMsg",
                message: JoinGameError.ERROR_CREATING_GAME,
              },
            })
            clearInterval(interval)
            return resolve(null)
          }
          pubsub.publish(`JOIN_GAME${playerId}`, {
            joinGame: {
              __typename: "JoinGameMsg",
              gameId: createGameResult.data.gameId,
            },
          })
          pubsub.publish(`JOIN_GAME${waitingPlayerId}`, {
            joinGame: {
              __typename: "JoinGameMsg",
              gameId: createGameResult.data.gameId,
            },
          })
          clearInterval(interval)
          return resolve(createGameResult.data.gameId)
        }
      }
      return null
    }, 1000)
  })

export const joinGame: NonNullable<SubscriptionResolvers["joinGame"]> = {
  subscribe: (_parent, { playerId }, _ctx) => {
    const sub = pubsub.asyncIterator(`JOIN_GAME${playerId}`)
    placeInQueue(playerId)
    return sub
  },
}
