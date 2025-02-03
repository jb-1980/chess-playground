import type { RouteConfigFunction } from "../types"
import { GameReview } from "./GameReview"

export const GameReviewRoute: RouteConfigFunction = (children) => ({
  path: "games/:gameId/review",
  element: <GameReview />,
  children: [
    {
      path: "*",
      element: <div>404</div>,
    },
    ...(children ?? []),
  ],
})
