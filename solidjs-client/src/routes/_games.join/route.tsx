import { lazy } from "solid-js"
import type { RouteConfigFunction } from "../types"

export const GamesJoinRoute: RouteConfigFunction = (children) => ({
  path: "games/join",
  component: lazy(() => import("./JoinGame")),
  children: [
    {
      path: "*",
      element: <div>404</div>,
    },
    ...(children ?? []),
  ],
})
