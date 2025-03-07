import { lazy } from "solid-js"
import { RouteConfigFunction } from "../types"

export const GamesIdRoute: RouteConfigFunction = () => ({
  path: "games/:gameId",
  component: lazy(() => import("./Game")),
})
