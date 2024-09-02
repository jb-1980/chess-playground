import { RouteConfigFunction } from "../types"
import { Game } from "./Game"

export const GamesIdRoute: RouteConfigFunction = () => ({
  path: "/games/:gameId",
  element: <Game />,
})
