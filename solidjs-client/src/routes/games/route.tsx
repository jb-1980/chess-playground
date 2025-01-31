import { lazy } from "solid-js"
import type { RouteConfigFunction } from "../types"

export const GamesRoute: RouteConfigFunction = (children) => ({
  path: "games",
  component: lazy(() => import("./Games")),
  children: [
    {
      path: "*",
      element: <div>404</div>,
    },
    ...(children ?? []),
  ],
})
