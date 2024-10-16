import { decodeToken, retrieveToken } from "../../resources/token"
import { Game } from "../../types/game"
import { GamesService } from "./games-service"

export class Games {
  public games: Game[] = []
  public error: string | null = null
  gamesService: GamesService

  constructor() {
    this.gamesService = new GamesService()
  }

  async canLoad() {
    const token = retrieveToken()
    const user = decodeToken(token)

    const playerId = user.id
    const response = await this.gamesService.getGames(playerId)

    if (response._type === "GamesError") {
      this.error = response.error
    } else {
      this.games = response.games
    }
  }
}
