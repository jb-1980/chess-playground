import { lazy } from "solid-js"
import type { RouteConfigFunction } from "../types"

export const GameReviewRoute: RouteConfigFunction = (children) => ({
  path: "games/:gameId/review",

  children: [
    {
      path: "/",
      component: lazy(() => import("./GameReview")),
    },
    {
      path: "*",
      element: <div>404</div>,
    },
    ...(children ?? []),
  ],
})
