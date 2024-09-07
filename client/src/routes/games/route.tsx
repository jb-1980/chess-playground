import type { RouteConfigFunction } from "../types"
import { Games } from "./Games"

export const GamesRoute: RouteConfigFunction = (children) => ({
  path: "games",
  element: <Games />,
  children: [
    {
      path: "*",
      element: <div>404</div>,
    },
    ...(children ?? []),
  ],
  loader: () => {
    return null
  },
})
