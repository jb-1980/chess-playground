import { Game } from "../../types/game"
import { testHandler } from "./server"

type SuccessResponse<T = Game | Game[]> = {
  data: T
  status: 200
}

type GameNotFoundErrorResponse = {
  data: string
  status: 404
}

type ServerErrorResponse = {
  data: string
  status: 500
}

export const gameHandlers = {
  getGames: (response: SuccessResponse<Game[]> | ServerErrorResponse) =>
    testHandler("/queries/get-games", response),

  getGameById: (
    response:
      | SuccessResponse<Game>
      | GameNotFoundErrorResponse
      | ServerErrorResponse,
  ) => testHandler("/queries/get-game-by-id", response),
}
