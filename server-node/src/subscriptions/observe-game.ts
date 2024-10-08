import { z } from "zod"
import { ExtWebSocket, pubsub } from "../server/websocket"

export const observeGameMessage = z.object({
  type: z.literal("observe-game"),
  payload: z.object({
    gameId: z.string(),
  }),
})

export const subscription_ObserveGame = async (
  payload: z.infer<typeof observeGameMessage>["payload"],
  ws: ExtWebSocket,
) => {
  const { gameId } = payload
  pubsub.subscribe(`OBSERVE_GAME.${gameId}`, ws)
}
