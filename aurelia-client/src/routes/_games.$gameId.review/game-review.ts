import { IRouteableComponent, IRouter } from "@aurelia/router"
import { Game } from "../../types/game"
import { GameReviewService } from "./game-review-service"
import { IDisposable, IEventAggregator, resolve } from "aurelia"
import { DEFAULT_POSITION } from "chess.js"
import { decodeToken, retrieveToken } from "../../resources/token"

export class GameReview implements IRouteableComponent {
  public game: Game
  public error: string | null = null
  public fen: string = DEFAULT_POSITION
  public myColor: "white" | "black" = "white"
  public moveIndex: number = 0

  private gameReviewService: GameReviewService
  private sub: IDisposable
  readonly eventAggregator: IEventAggregator = resolve(IEventAggregator)
  readonly router: IRouter = resolve(IRouter)

  constructor() {
    this.gameReviewService = new GameReviewService()
  }

  async canLoad(parameters: { gameId: string }) {
    const gameId = parameters.gameId
    const response = await this.gameReviewService.getGame(gameId)

    if (response._type === "GameError") {
      this.error = response.error
    } else {
      const user = decodeToken(retrieveToken())
      this.game = response.game
      this.moveIndex = this.game.moves.length - 1
      this.fen = this.game.moves[this.moveIndex]?.after ?? DEFAULT_POSITION
      this.myColor = this.game.blackPlayer.id === user.id ? "black" : "white"
    }
  }

  bound() {
    this.sub = this.eventAggregator.subscribe(
      "MOVE_CLICKED",
      (index: number) => {
        this.moveIndex = index
        this.fen = this.game.moves[index]?.after ?? DEFAULT_POSITION
      },
    )
  }

  unbinding() {
    this.sub.dispose()
  }
}
