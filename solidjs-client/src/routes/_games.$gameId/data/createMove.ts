import { Move } from "chess.js"
import { createApiMutation } from "../../../lib/api-handlers"

type MoveResponseObject = {
  newPGN: string
}

export const createMove = () =>
  createApiMutation<{ gameId: string; move: Move }, MoveResponseObject>(
    "/commands/move",
  )
