import { NoMatch } from "../Root/NoMatch"
import type { RouteConfigFunction } from "../types"
import { Index } from "./Index"

export const IndexRoute: RouteConfigFunction = (children) => ({
  path: "/",
  element: <Index />,
  children: [
    {
      path: "*",
      element: <NoMatch />,
    },
    ...(children ?? []),
  ],
})
