import { z } from "zod"
import { command_CreateGame } from "../commands/create-game"
import {
  makeErrorMessage,
  makeJoinGameResponseMessage,
  PlayersInActiveGames,
  Queue,
} from "../lib/pubsub"
import { isFailure } from "../lib/result"
import { shiftSet } from "../lib/set-utils"
import { Context } from "../middleware/context/context"
import { ExtWebSocket, pubsub } from "../server/websocket"

const placeInQueue = (playerId: string, context: Context) =>
  new Promise<string | null>((resolve) => {
    const now = Date.now()
    // try for 30 seconds to find a match, else return no match found
    const timeout = now + 30000
    const interval = setInterval(async () => {
      if (Date.now() > timeout) {
        pubsub.publish({
          topic: `JOIN_GAME.${playerId}`,
          payload: makeErrorMessage("No match found", null),
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
          const createGameResult = await command_CreateGame(
            [newPlayerId, waitingPlayerId],
            context,
          )

          if (isFailure(createGameResult)) {
            const message = makeErrorMessage(
              "Error creating game",
              createGameResult.message,
            )
            pubsub.publish({
              topic: `JOIN_GAME.${playerId}`,
              payload: message,
            })
            pubsub.publish({
              topic: `JOIN_GAME.${waitingPlayerId}`,
              payload: message,
            })
            clearInterval(interval)
            return resolve(null)
          }

          const message = makeJoinGameResponseMessage({
            gameId: createGameResult.data.gameId,
          })
          pubsub.publish({
            topic: `JOIN_GAME.${playerId}`,
            payload: message,
          })
          pubsub.publish({
            topic: `JOIN_GAME.${waitingPlayerId}`,
            payload: message,
          })
          clearInterval(interval)
          return resolve(createGameResult.data.gameId)
        }
      }
      return null
    }, 1000)
  })

export const joinGameMessage = z.object({
  type: z.literal("join-game"),
  payload: z.object({
    playerId: z.string(),
  }),
})

export const subscription_joinGame = async (
  payload: z.infer<typeof joinGameMessage>["payload"],
  ws: ExtWebSocket,
) => {
  const { playerId } = payload
  pubsub.subscribe(`JOIN_GAME.${playerId}`, ws)

  const gameId = await placeInQueue(playerId, ws.context)
  return gameId
}
