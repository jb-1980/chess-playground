import { lazy } from "solid-js"
import type { RouteConfigFunction } from "../types"

export const GamesRoute: RouteConfigFunction = (children) => ({
  path: "games",
  // component: lazy(() => import("./Games")),
  children: [
    {
      path: "/",
      component: lazy(() => import("./Games")),
    },
    {
      path: "*",
      component: () => <div>404</div>,
    },
    ...(children ?? []),
  ],
})
