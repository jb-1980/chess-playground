import type { RouteConfigFunction } from "../types"
import { JoinGame } from "./JoinGame"

export const GamesJoinRoute: RouteConfigFunction = (children) => ({
  path: "games/join",
  element: <JoinGame />,
  children: [
    {
      path: "*",
      element: <div>404</div>,
    },
    ...(children ?? []),
  ],
})
